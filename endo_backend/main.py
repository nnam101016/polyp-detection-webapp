# main.py
from datetime import datetime, timedelta, timezone
from collections import Counter
from typing import List

import io
import os
import uuid
import time

import numpy as np
from PIL import Image

from fastapi import FastAPI, HTTPException, Depends, UploadFile, Form, File, Query, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from fastapi.middleware.gzip import GZipMiddleware

from dotenv import load_dotenv
from jose import jwt, JWTError
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr, constr
from ultralytics import YOLO

# ---- Torch / CV deps ----
import torch
import cv2
from torchvision.transforms import functional as TF
from torchvision.models.detection import maskrcnn_resnet50_fpn
from bson import ObjectId

try:
    import segmentation_models_pytorch as smp
    _HAS_SMP = True
except Exception:
    _HAS_SMP = False

import s3  # project S3 helper module


# =========================
# Config: weights & params
# =========================

YOLO_WEIGHTS_9T = "./model/yolo_9t.pt"
YOLO_WEIGHTS_11N = "./model/yolo_11n.pt"

# Mask R-CNN (torchvision)
MASKRCNN_WEIGHTS = "./model/maskrcnn_best.pth"
MASKRCNN_INPUT_SIZE = (256, 256)  # (W,H)
MASKRCNN_SCORE_THRESH = 0.75
MASKRCNN_MASK_THRESH = 0.5

# U-Net (SMP)
UNET_WEIGHTS   = "./model/unet_effb7_adam.pth"
UNETPP_WEIGHTS = "./model/unetpp_effb7_adam.pth"
UNET_ENCODER_NAME = "efficientnet-b7"
UNET_INPUT_SIZE   = (256, 256)  # (W,H)
UNET_THRESHOLD    = 0.75


TASK_DETECTION     = "detection"
TASK_SEG_INSTANCE  = "segmentation_instance"
TASK_SEG_SEMANTIC  = "segmentation_semantic"
RESULT_SCHEMA_VERSION = 2

# Datetime UTC+7
TZ_UTC7 = timezone(timedelta(hours=7))
def now_utc7():
    return datetime.now(TZ_UTC7)


# =========================
# Model registry (lazy)
# =========================

AVAILABLE_MODELS = {
    "yolo_9t":  {"task": TASK_DETECTION, "model": YOLO(YOLO_WEIGHTS_9T)},
    "yolo_11n": {"task": TASK_DETECTION, "model": YOLO(YOLO_WEIGHTS_11N)},
    "maskrcnn": {"task": TASK_SEG_INSTANCE, "model": None, "weights": MASKRCNN_WEIGHTS},
    "unet":     {"task": TASK_SEG_SEMANTIC, "model": None, "weights": UNET_WEIGHTS},
    "unetpp":   {"task": TASK_SEG_SEMANTIC, "model": None, "weights": UNETPP_WEIGHTS},
}

# ==== CHANGED: helper to force names -> "polyp"
def _force_polyp_names(names):
    try:
        if isinstance(names, dict):
            return {k: "polyp" for k in names.keys()}
        if isinstance(names, (list, tuple)):
            return ["polyp"] * len(names)
    except Exception:
        pass
    return {0: "polyp"}

for k, v in AVAILABLE_MODELS.items():
    m = v.get("model")
    if m is not None and hasattr(m, "eval"):
        # ==== CHANGED: make YOLO models display "polyp" on overlays by default
        if v.get("task") == TASK_DETECTION and hasattr(m, "names"):
            try:
                m.names = _force_polyp_names(m.names)
            except Exception:
                pass
        m.eval()

def _area_pct_from_det(det, img_w, img_h):
    """Return % of image covered by the lesion (mask preferred, else bbox)."""
    if not img_w or not img_h:
        return None
    a = det.get("mask_area_px")
    if a is None:
        a = det.get("bbox_area_px")
    if not a:
        return None
    return 100.0 * float(a) / float(img_w * img_h)

def _size_class_from_area_pct(area_pct):
    """Map coverage % to clinically meaningful size bins (proxy for diameter)."""
    if area_pct is None:
        return "unknown"
    if area_pct < 2.0:
        return "diminutive (≤5 mm est.)"
    if area_pct < 6.0:
        return "small (6–9 mm est.)"
    return "large (≥10 mm est.)"



# =========================
# Loaders (lazy)
# =========================

def load_maskrcnn(weights_path: str):
    model = maskrcnn_resnet50_fpn(weights=None, num_classes=2)
    sd = torch.load(weights_path, map_location="cpu")
    model.load_state_dict(sd, strict=False)
    model.eval()
    return model

def load_unet(weights_path: str, use_plusplus: bool = False):
    if not _HAS_SMP:
        raise RuntimeError("segmentation_models_pytorch is not installed on the server.")
    if use_plusplus:
        model = smp.UnetPlusPlus(
            encoder_name=UNET_ENCODER_NAME,
            encoder_weights=None,
            in_channels=3,
            classes=1,
            activation=None,
        )
    else:
        model = smp.Unet(
            encoder_name=UNET_ENCODER_NAME,
            encoder_weights=None,
            in_channels=3,
            classes=1,
            activation=None,
        )
    sd = torch.load(weights_path, map_location="cpu")
    model.load_state_dict(sd, strict=False)
    model.eval()
    return model


def _ensure_loaded(name: str):
    entry = AVAILABLE_MODELS.get(name)
    if entry is None:
        raise HTTPException(status_code=400, detail=f"Unknown or unavailable model '{name}'")
    if entry["model"] is not None:
        return
    if name == "maskrcnn":
        entry["model"] = load_maskrcnn(entry["weights"])
    elif name == "unet":
        entry["model"] = load_unet(entry["weights"], use_plusplus=False)
    elif name == "unetpp":
        entry["model"] = load_unet(entry["weights"], use_plusplus=True)
    else:
        raise HTTPException(status_code=500, detail=f"Unknown lazy model '{name}'")
    

# =========================
# Rendering & result utils
# =========================

def draw_mask_overlay(
    rgb_np,
    mask_bin,
    fill_color=(0, 222, 255),
    fill_alpha=0.35,
    line_color=(0, 222, 255),
    line_thickness=3,
    draw_centroid=True,
):
    if mask_bin is None or mask_bin.sum() == 0:
        return rgb_np

    base = rgb_np.copy()
    color_img = np.zeros_like(base, dtype=np.uint8)
    color_img[:] = np.array(fill_color, dtype=np.uint8)
    filled = cv2.addWeighted(base, 1.0 - fill_alpha, color_img, fill_alpha, 0)
    m3 = mask_bin.astype(bool)[..., None]
    base = np.where(m3, filled, base)

    cnts, _ = cv2.findContours(mask_bin.astype(np.uint8), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if cnts:
        cv2.drawContours(base, cnts, -1, line_color, thickness=line_thickness, lineType=cv2.LINE_AA)
        if draw_centroid:
            for c in cnts:
                M = cv2.moments(c)
                if M["m00"] > 0:
                    cx = int(M["m10"] / M["m00"])
                    cy = int(M["m01"] / M["m00"])
                    cv2.circle(base, (cx, cy), 5, (255, 255, 255), -1, lineType=cv2.LINE_AA)
                    cv2.circle(base, (cx, cy), 8, (0, 0, 0), 1, lineType=cv2.LINE_AA)
    return base

def _mask_to_polygons(mask_bin):
    polys = []
    cnts, _ = cv2.findContours(mask_bin.astype(np.uint8), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    for c in cnts:
        if len(c) >= 3:
            c = c.reshape(-1, 2)
            polys.append([float(x) for xy in c for x in xy])
    return polys

def build_summary(dets, img_w, img_h, timing_ms=None):
    class_counts = Counter([d.get("class_name", "polyp") for d in dets])
    confs = [d.get("confidence") for d in dets if d.get("confidence") is not None]
    confs = [c for c in confs if c is not None]

    # ---- Clinical-only distilled view
    lesions = []
    area_pcts = []
    for d in dets:
        ap = _area_pct_from_det(d, img_w, img_h)
        area_pcts.append(ap if ap is not None else 0.0)
        lesions.append({
            "id": d.get("detection_id"),
            "confidence": float(d.get("confidence") or 0.0),
            "size_class": _size_class_from_area_pct(ap),
            "area_pct": float(ap) if ap is not None else None,
        })
    largest_ap = max(area_pcts) if area_pcts else 0.0

    clinical = {
        "polyp_count": len(dets),
        "largest_lesion_area_pct": float(largest_ap),
        "lesions": lesions,
        # (keep room for future fields like image_quality, NICE-type, etc.)
    }

    return {
        "num_detections": len(dets),
        "class_counts": dict(class_counts),
        "confidence_mean": float(np.mean(confs)) if confs else 0.0,
        "confidence_max": float(np.max(confs)) if confs else 0.0,
        "image_size": {"width": int(img_w or 0), "height": int(img_h or 0)},
        "time_ms": timing_ms or {},
        "clinical": clinical,   # ✅ add this
    }



# =========================
# Predictors (per task)
# =========================

def predict_maskrcnn(model, pil_img, score_thresh: float = MASKRCNN_SCORE_THRESH, mask_thresh: float = MASKRCNN_MASK_THRESH):
    img = pil_img.convert("RGB")
    orig_h, orig_w = img.height, img.width

    resized = img.resize(MASKRCNN_INPUT_SIZE, Image.BILINEAR)
    tensor = TF.to_tensor(resized)

    t0 = time.time()
    with torch.no_grad():
        out = model([tensor])[0]
    infer_ms = {"inference": (time.time() - t0) * 1000.0}

    dets = []
    union_mask = np.zeros((orig_h, orig_w), dtype=np.uint8)

    scores = out.get("scores")
    masks  = out.get("masks")
    labels = out.get("labels")

    if scores is not None and masks is not None:
        scores = scores.cpu().numpy()
        masks  = masks.cpu().numpy()
        labels = labels.cpu().numpy() if labels is not None else np.zeros_like(scores)

        keep = [i for i, s in enumerate(scores) if s >= float(score_thresh)]
        for i in keep:
            m_small = masks[i, 0]
            m_bin_small = (m_small > float(mask_thresh)).astype(np.uint8)

            m_up = cv2.resize(m_bin_small, (orig_w, orig_h), interpolation=cv2.INTER_NEAREST).astype(np.uint8)
            if m_up.sum() == 0:
                continue

            union_mask = np.maximum(union_mask, m_up)
            polys = _mask_to_polygons(m_up)
            conf = float(scores[i])

            dets.append({
                "detection_id": len(dets),
                "class_id": int(labels[i]) if labels is not None else 0,
                "class_name": "polyp",
                "confidence": conf,
                "mask_area_px": int(m_up.sum()),
                "mask_polygons": polys
            })

    overlay = draw_mask_overlay(np.array(img), union_mask)
    summary = build_summary(dets, orig_w, orig_h, timing_ms=infer_ms)
    result = {
        "schema": RESULT_SCHEMA_VERSION,
        "result_meta": {"task": TASK_SEG_INSTANCE},
        "detections": dets,
        "summary": summary
    }
    return overlay, result


def predict_unet(model, pil_img, thresh: float = UNET_THRESHOLD, class_idx: int = 0):
    """
    Returns per-lesion (component) detections for semantic segmentation.
    - Confidence per lesion = mean(prob) within that component
    - Area uses pixel count of the component at original resolution
    """
    img = pil_img.convert("RGB")
    H, W = img.height, img.width
    rgb = np.array(img)

    # ----- forward pass on resized image
    resized = cv2.resize(rgb, UNET_INPUT_SIZE, interpolation=cv2.INTER_LINEAR)
    x = resized.astype(np.float32) / 255.0
    x = np.transpose(x, (2, 0, 1))[None, ...]
    x_t = torch.from_numpy(x)

    with torch.no_grad():
        out = model(x_t)
        if isinstance(out, (list, tuple)):
            out = out[0]
        if out.shape[1] == 1:
            probs_small = torch.sigmoid(out)[0, 0].cpu().numpy()
        else:
            probs_all = torch.softmax(out, dim=1)[0].cpu().numpy()
            probs_small = probs_all[class_idx]

    # ----- upsample probabilities & binarize
    probs = cv2.resize(probs_small, (W, H), interpolation=cv2.INTER_LINEAR)
    mask_bin = (probs >= float(thresh)).astype(np.uint8)

    # ----- split into connected components (each = 1 polyp)
    dets = []
    component_mask = mask_bin.copy()
    num_labels, labels, stats, centroids = cv2.connectedComponentsWithStats(component_mask, connectivity=8)

    # label 0 is background
    for label in range(1, num_labels):
        area_px = int(stats[label, cv2.CC_STAT_AREA])
        if area_px <= 0:
            continue

        comp_bin = (labels == label).astype(np.uint8)

        # per-component confidence = mean prob inside the component
        comp_probs = probs[labels == label]
        conf = float(comp_probs.mean()) if comp_probs.size > 0 else 0.0

        # polygons for the component
        polys = _mask_to_polygons(comp_bin)

        dets.append({
            "detection_id": len(dets),
            "class_id": 0,
            "class_name": "polyp",
            "confidence": conf,
            "mask_area_px": area_px,
            "mask_polygons": polys
        })

    # overlay still shows the union (nice & simple); keep as-is
    overlay = draw_mask_overlay(np.array(img), mask_bin)

    summary = build_summary(dets, W, H)
    result = {
        "schema": RESULT_SCHEMA_VERSION,
        "result_meta": {"task": TASK_SEG_SEMANTIC},
        "detections": dets,
        "summary": summary
    }
    return overlay, result


# ==== YOLO -> result dict =====================================================

def _safe_class_name(class_names, cls_id: int):
    try:
        if isinstance(class_names, dict):
            return class_names.get(cls_id, str(cls_id))
        return class_names[cls_id]
    except Exception:
        return str(cls_id)

def _norm_xy_list(xy_list, w: int, h: int):
    out = []
    for i, v in enumerate(xy_list):
        out.append(float(v) / (w if i % 2 == 0 else h))
    return out

def yolo_result_to_dict(res, class_names):
    orig_h, orig_w = res.orig_shape[:2] if hasattr(res, "orig_shape") else (None, None)
    if orig_h is None or orig_w is None:
        try:
            orig_h, orig_w = res.orig_img.shape[:2]
        except Exception:
            orig_w = orig_w or 0
            orig_h = orig_h or 0

    dets = []

    boxes = getattr(res, "boxes", None)
    if boxes is not None and len(boxes) > 0:
        xyxy = boxes.xyxy.cpu().numpy() if hasattr(boxes.xyxy, "cpu") else boxes.xyxy
        xywh = boxes.xywh.cpu().numpy() if hasattr(boxes.xywh, "cpu") else boxes.xywh
        conf = boxes.conf.cpu().numpy() if hasattr(boxes.conf, "cpu") else boxes.conf
        cls  = boxes.cls.cpu().numpy()  if hasattr(boxes.cls, "cpu")  else boxes.cls

        for i in range(len(xyxy)):
            x1, y1, x2, y2 = [float(v) for v in xyxy[i].tolist()]
            cx, cy, bw, bh  = [float(v) for v in xywh[i].tolist()]
            c  = float(conf[i])
            ci = int(cls[i])

            # ==== CHANGED: force name to "polyp" (JSON output)
            # name = _safe_class_name(class_names, ci)
            name = "polyp"

            bbox_area_px = int(max(bw, 0.0) * max(bh, 0.0))
            aspect_ratio = float(bw / bh) if bh > 0 else None

            dets.append({
                "detection_id": i,
                "class_id": ci,
                "class_name": name,
                "confidence": c,
                "bbox_xyxy": [x1, y1, x2, y2],
                "bbox_xywh": [cx, cy, bw, bh],
                "bbox_xyxy_norm": _norm_xy_list([x1, y1, x2, y2], orig_w, orig_h) if orig_w and orig_h else None,
                "bbox_xywh_norm": [
                    cx / orig_w if orig_w else None,
                    cy / orig_h if orig_h else None,
                    bw / orig_w if orig_w else None,
                    bh / orig_h if orig_h else None,
                ],
                "bbox_area_px": bbox_area_px,
                "aspect_ratio": aspect_ratio,
            })

    masks = getattr(res, "masks", None)
    if masks is not None and getattr(masks, "xy", None):
        polys_per_det = masks.xy
        for i, polys in enumerate(polys_per_det):
            if i >= len(dets):
                continue
            flat_polys = []
            total_area = 0.0
            for poly in polys:
                pts = np.asarray(poly, dtype=np.float32).reshape(-1, 2)
                if pts.shape[0] >= 3:
                    total_area += float(cv2.contourArea(pts))
                    flat_polys.append([float(x) for xy in pts for x in xy])
            if flat_polys:
                dets[i]["mask_polygons"] = flat_polys
                dets[i]["mask_area_px"] = int(round(total_area))

    summary = build_summary(dets, orig_w or 0, orig_h or 0)
    result = {
        "schema": RESULT_SCHEMA_VERSION,
        "result_meta": {"task": TASK_DETECTION},
        "detections": dets,
        "summary": summary,
    }
    return result


# ======================
# FastAPI app + auth/db
# ======================

load_dotenv()
MONGODB_URI = os.environ.get("MONGODB_URI")
if not MONGODB_URI:
    raise RuntimeError("MONGODB_URI not set in environment.")
client = AsyncIOMotorClient(MONGODB_URI)
db = client["polyp_detection"]
scans_collection = db["scans"]
users_collection = db["users"]

app = FastAPI()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# GZip for smaller JSON payloads
app.add_middleware(GZipMiddleware, minimum_size=1024)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
def hash_password(password: str) -> str:
    return pwd_context.hash(password)
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "dev_local_secret_change_me")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60
def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    name: str = ""
    workplace: str = ""
    address: str = ""
    occupation: str = ""
    phone: str = ""

class AdminCreateUser(BaseModel):
    email: EmailStr
    password: constr(min_length=6)
    name: str | None = None
    is_admin: bool = False


@app.on_event("startup")
async def setup_indexes():
    # DO NOT create {_id:-1}; Mongo requires _id:1 and creates it automatically.
    # This compound index makes user-scoped, cursor-based pagination fast.
    await scans_collection.create_index([("user_id", 1), ("_id", -1)])


@app.post("/register")
async def register(user: UserCreate):
    existing = await users_collection.find_one({"email": user.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered.")
    hashed_pw = hash_password(user.password)
    user_doc = {
        "email": user.email,
        "hashed_password": hashed_pw,
        "is_admin": False,
        "created_at": datetime.utcnow()
    }
    await users_collection.insert_one(user_doc)
    return {"message": "User registered successfully."}


@app.post("/login")
async def login(user: UserLogin):
    db_user = await users_collection.find_one({"email": user.email})
    if not db_user or not verify_password(user.password, db_user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials.")
    token = create_access_token({
        "sub": user.email,
        "user_id": str(db_user["_id"]),
        "is_admin": db_user.get("is_admin", False)
    })
    return {"access_token": token, "token_type": "bearer"}


async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials.",
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = await users_collection.find_one({"email": email})
    if user is None:
        raise credentials_exception
    return user


async def admin_required(current_user: dict = Depends(get_current_user)):
    if not current_user.get("is_admin", False):
        raise HTTPException(status_code=403, detail="Admin access only.")
    return current_user

require_admin = admin_required


# ====================
# Profile Endpoints
# ====================
@app.put("/profile")
async def update_profile(update: UserUpdate, current_user: dict = Depends(get_current_user)):
    await users_collection.update_one({"_id": current_user["_id"]}, {"$set": update.dict()})
    return {"message": "Profile updated successfully."}


@app.get("/profile")
async def read_profile(current_user: dict = Depends(get_current_user)):
    return {
        "email": current_user.get("email"),
        "user_id": str(current_user.get("_id")),
        "created_at": current_user.get("created_at"),
        "name": current_user.get("name", ""),
        "workplace": current_user.get("workplace", ""),
        "address": current_user.get("address", ""),
        "occupation": current_user.get("occupation", ""),
        "phone": current_user.get("phone", ""),
        "is_admin": current_user.get("is_admin", False)
    }


# ==================
# History Endpoints
# ==================
# Legacy (heavy) — kept for compatibility
@app.get("/history")
async def get_upload_history(current_user: dict = Depends(get_current_user)):
    cursor = (
        scans_collection
        .find({"user_id": str(current_user["_id"])})
        .sort("datetime", -1)
    )
    docs = await cursor.to_list(length=1000)
    return [
        {
            "patient_name": d.get("patient_name"),
            "patient_id": d.get("patient_id"),
            "datetime": d.get("datetime"),
            "s3_url": d.get("s3_url"),
            "processed_s3_url": d.get("processed_s3_url"),
            "result": d.get("result"),
            "notes": d.get("notes"),
            "model_used": d.get("model_used"),
            "id": str(d.get("_id")),
        }
        for d in docs
    ]

# Paged + summary-only (fast)
@app.get("/history_paged")
async def get_upload_history_paged(
    limit: int = Query(20, ge=1, le=100),
    cursor: str | None = None,
    current_user: dict = Depends(get_current_user),
):
    q = {"user_id": str(current_user["_id"])}
    if cursor:
        try:
            q["_id"] = {"$lt": ObjectId(cursor)}
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid cursor")

    proj = {
        "patient_name": 1,
        "patient_id": 1,
        "datetime": 1,
        "s3_url": 1,
        "processed_s3_url": 1,
        "model_used": 1,
        "result.summary": 1,
    }

    cur = scans_collection.find(q, proj).sort("_id", -1).limit(limit + 1)
    docs = await cur.to_list(length=limit + 1)

    next_cursor = None
    if len(docs) > limit:
        next_cursor = str(docs[-1]["_id"])
        docs = docs[:-1]

    items = []
    for d in docs:
        items.append({
            "id": str(d["_id"]),
            "patient_name": d.get("patient_name"),
            "patient_id": d.get("patient_id"),
            "datetime": d.get("datetime"),
            "s3_url": d.get("s3_url"),
            "processed_s3_url": d.get("processed_s3_url"),
            "model_used": d.get("model_used") or "default",
            "result": {"summary": d.get("result", {}).get("summary", {})},
        })
    return {"items": items, "next_cursor": next_cursor}

# Detail on demand
@app.get("/history/{upload_id}")
async def get_upload_detail(upload_id: str, current_user: dict = Depends(get_current_user)):
    try:
        oid = ObjectId(upload_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid id")
    d = await scans_collection.find_one({"_id": oid, "user_id": str(current_user["_id"])})
    if not d:
        raise HTTPException(status_code=404, detail="Not found")
    d["_id"] = str(d["_id"])
    return d

# User bulk delete (Mongo + S3) — deletes only the caller’s docs
class BulkDeletePayload(BaseModel):
    ids: list[str]

# Helper: delete S3 by URL (best-effort)
def _delete_s3_url(url: str) -> bool:
    if not url:
        return False
    # Try project helper first
    for fn in ("delete_by_url", "delete_from_s3_url"):
        if hasattr(s3, fn):
            try:
                getattr(s3, fn)(url)
                return True
            except Exception:
                pass
    # Fallback via boto3 if available
    try:
        import boto3
        bucket = os.environ.get("S3_BUCKET") or os.environ.get("AWS_S3_BUCKET")
        if not bucket:
            return False
        if f"{bucket}/" in url:
            key = url.split(f"{bucket}/", 1)[-1]
        else:
            key = url.split("/", 3)[-1]
        boto3.client("s3").delete_object(Bucket=bucket, Key=key)
        return True
    except Exception:
        return False

@app.post("/history/bulk_delete")
async def user_bulk_delete_uploads(
    payload: BulkDeletePayload,
    current_user: dict = Depends(get_current_user),
):
    # Validate ids
    oid_list = []
    for _id in payload.ids or []:
        try:
            oid_list.append(ObjectId(_id))
        except Exception:
            pass
    if not oid_list:
        return {"deleted_count": 0, "s3_deleted": 0}

    # Load only caller-owned docs to enforce ownership and to collect S3 urls
    q = {"_id": {"$in": oid_list}, "user_id": str(current_user["_id"])}
    cursor = scans_collection.find(q, {"s3_url": 1, "processed_s3_url": 1})
    urls = []
    async for d in cursor:
        if d.get("s3_url"): urls.append(d["s3_url"])
        if d.get("processed_s3_url"): urls.append(d["processed_s3_url"])

    s3_deleted = 0
    for url in urls:
        if _delete_s3_url(url):
            s3_deleted += 1

    res = await scans_collection.delete_many(q)
    return {"deleted_count": res.deleted_count, "s3_deleted": s3_deleted}


# ==============================
# Upload (with model selection)
# ==============================
@app.post("/upload")
async def upload(
    files: List[UploadFile] = File(...),
    patient_name: str = Form(...),
    patient_id: str = Form(...),
    notes: str = Form(""),
    model_name: str = Form("yolo_9t"),
    current_user: dict = Depends(get_current_user)
):
    if model_name not in AVAILABLE_MODELS:
        raise HTTPException(status_code=400, detail="Unknown model selected")

    _ensure_loaded(model_name)
    task = AVAILABLE_MODELS[model_name]["task"]
    model = AVAILABLE_MODELS[model_name]["model"]

    upload_results = []

    for file in files:
        unique_filename = f"{uuid.uuid4()}_{file.filename}"
        image_bytes = await file.read()

        s3_url = s3.upload_to_s3(io.BytesIO(image_bytes), unique_filename)
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")

        if task == TASK_DETECTION:
            # ==== CHANGED: ensure model + result names are "polyp" so res.plot() uses it
            if hasattr(model, "names"):
                try:
                    model.names = _force_polyp_names(model.names)
                except Exception:
                    pass

            preds = model.predict(image, verbose=False, iou=0.3)
            res = preds[0]

            try:
                res.names = _force_polyp_names(getattr(res, "names", getattr(model, "names", {})))
            except Exception:
                pass

            result_dict = yolo_result_to_dict(res, res.names)

            rendered_bgr = res.plot()  # BGR
            rendered_rgb = cv2.cvtColor(rendered_bgr, cv2.COLOR_BGR2RGB)
            processed_img = Image.fromarray(rendered_rgb)

        elif task == TASK_SEG_INSTANCE:
            overlay_np, result_dict = predict_maskrcnn(model, image)
            processed_img = Image.fromarray(overlay_np)

        elif task == TASK_SEG_SEMANTIC:
            overlay_np, result_dict = predict_unet(model, image)
            processed_img = Image.fromarray(overlay_np)

        else:
            raise HTTPException(status_code=500, detail=f"Unsupported task: {task}")

        result_dict["result_meta"]["model_name"] = model_name

        buffer = io.BytesIO()
        processed_img.save(buffer, format="JPEG")
        buffer.seek(0)
        processed_s3_url = s3.upload_to_s3(buffer, "processed_" + unique_filename)

        now = now_utc7()

        doc = {
            "user_id": str(current_user["_id"]),
            "user_email": current_user["email"],
            "patient_name": patient_name,
            "patient_id": patient_id,
            "datetime":  now.isoformat(timespec="seconds"),
            "filename": unique_filename,
            "s3_url": s3_url,
            "processed_s3_url": processed_s3_url,
            "result": result_dict,
            "notes": notes,
            "model_used": model_name
        }
        await scans_collection.insert_one(doc)

        upload_results.append({
            "s3_url": s3_url,
            "processed_s3_url": processed_s3_url,
            "result": result_dict,
            "model": model_name
        })

    return {
        "message": f"{len(upload_results)} files uploaded and scanned successfully with {model_name} model.",
        "results": upload_results
    }


# ===============
# Models/meta
# ===============
@app.get("/models")
async def get_models():
    return {"models": list(AVAILABLE_MODELS.keys())}


# ======================
# Admin-only Endpoints
# ======================
@app.put("/admin/users/{user_id}/promote")
async def promote_user(user_id: str, current_user: dict = Depends(admin_required)):
    from bson import ObjectId as _OID
    result = await users_collection.update_one({"_id": _OID(user_id)}, {"$set": {"is_admin": True}})
    return {"modified_count": result.modified_count}

@app.get("/admin/stats")
async def get_admin_stats(current_user: dict = Depends(admin_required)):
    total_users = await users_collection.count_documents({})
    total_uploads = await scans_collection.count_documents({})
    return {"total_users": total_users, "total_uploads": total_uploads}

@app.get("/admin/users")
async def get_all_users(current_user: dict = Depends(admin_required)):
    cursor = users_collection.find({}, {"hashed_password": 0})
    users = []
    async for user in cursor:
        user["_id"] = str(user["_id"])
        users.append(user)
    return users

@app.post("/admin/users", status_code=201)
async def admin_create_user(payload: AdminCreateUser, _admin=Depends(admin_required)):
    existing = await users_collection.find_one({"email": payload.email})
    if existing:
        raise HTTPException(status_code=409, detail="Email already exists")

    hashed = hash_password(payload.password)
    doc = {
        "email": payload.email,
        "hashed_password": hashed,
        "name": payload.name or "",
        "is_admin": payload.is_admin,
        "created_at": datetime.utcnow(),
    }
    await users_collection.insert_one(doc)
    return {
        "message": "User created",
        "user": {
            "email": doc["email"],
            "name": doc["name"],
            "is_admin": doc["is_admin"],
            "created_at": doc["created_at"],
        },
    }

@app.delete("/admin/users/{user_id}")
async def delete_user(user_id: str, current_user: dict = Depends(admin_required)):
    from bson import ObjectId as _OID
    result = await users_collection.delete_one({"_id": _OID(user_id)})
    return {"deleted_count": result.deleted_count}

# Legacy (heavy) — kept for existing UI
@app.get("/admin/uploads")
async def admin_get_all_uploads(current_user: dict = Depends(admin_required)):
    cursor = scans_collection.find()
    uploads = []
    async for upload in cursor:
        upload["_id"] = str(upload["_id"])
        uploads.append(upload)
    return uploads

# Paged + summary-only for dashboard
@app.get("/admin/uploads_paged")
async def admin_get_uploads_paged(
    limit: int = Query(50, ge=1, le=200),
    cursor: str | None = None,
    _admin = Depends(admin_required),
):
    q = {}
    if cursor:
        try:
            q["_id"] = {"$lt": ObjectId(cursor)}
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid cursor")

    proj = {
        "patient_name": 1,
        "user_email": 1,
        "datetime": 1,
        "s3_url": 1,
        "processed_s3_url": 1,
        "result.summary": 1,
    }
    cur = scans_collection.find(q, proj).sort("_id", -1).limit(limit + 1)
    docs = await cur.to_list(length=limit + 1)

    next_cursor = None
    if len(docs) > limit:
        next_cursor = str(docs[-1]["_id"])
        docs = docs[:-1]

    items = []
    for d in docs:
        items.append({
            "_id": str(d["_id"]),
            "patient_name": d.get("patient_name"),
            "user_email": d.get("user_email"),
            "datetime": d.get("datetime"),
            "s3_url": d.get("s3_url"),
            "processed_s3_url": d.get("processed_s3_url"),
            "result": {"summary": d.get("result", {}).get("summary", {})},
        })
    return {"items": items, "next_cursor": next_cursor}

@app.post("/admin/uploads/bulk_delete")
async def admin_bulk_delete_uploads(
    payload: BulkDeletePayload = Body(...),
    _admin = Depends(admin_required),
):
    if not payload.ids:
        return {"deleted_count": 0, "s3_deleted": 0}

    oid_list = []
    for _id in payload.ids:
        try:
            oid_list.append(ObjectId(_id))
        except Exception:
            pass
    if not oid_list:
        return {"deleted_count": 0, "s3_deleted": 0}

    # fetch docs to get S3 URLs
    docs = scans_collection.find({"_id": {"$in": oid_list}}, {"s3_url": 1, "processed_s3_url": 1})
    urls = []
    async for d in docs:
        if d.get("s3_url"): urls.append(d["s3_url"])
        if d.get("processed_s3_url"): urls.append(d["processed_s3_url"])

    s3_deleted = 0
    for url in urls:
        if _delete_s3_url(url):
            s3_deleted += 1

    res = await scans_collection.delete_many({"_id": {"$in": oid_list}})
    return {"deleted_count": res.deleted_count, "s3_deleted": s3_deleted}
