# main.py
from datetime import datetime, timedelta
from collections import Counter
from typing import List
import io
import os
import uuid
import time

import numpy as np
from PIL import Image

from fastapi import FastAPI, HTTPException, Depends, UploadFile, Form, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer

from dotenv import load_dotenv
from jose import jwt, JWTError
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr
from ultralytics import YOLO

# ---- Torch / CV deps ----
import torch
import cv2
from torchvision.transforms import functional as TF
from torchvision.models.detection import maskrcnn_resnet50_fpn

try:
    import segmentation_models_pytorch as smp
    _HAS_SMP = True
except Exception:
    _HAS_SMP = False

import s3  # your existing S3 helper


# =========================
# Config: weights & params
# =========================

YOLO_WEIGHTS = "./model/best_new.pt"

# Mask R-CNN (torchvision)
MASKRCNN_WEIGHTS = "./model/maskrcnn_best.pth"
MASKRCNN_INPUT_SIZE = (256, 256)  # (W,H) per notebook
MASKRCNN_SCORE_THRESH = 0.75      # per notebook
MASKRCNN_MASK_THRESH = 0.5

# U-Net (SMP) — match your friend's notebook
UNET_WEIGHTS = "./model/unet_effb7_adam.pth"
UNET_ENCODER_NAME = "efficientnet-b7"
UNET_INPUT_SIZE   = (256, 256)    # (W,H)
UNET_THRESHOLD    = 0.75

# Post-processing to suppress speckles
UNET_MIN_AREA_PCT = 0.0005              # drop connected components smaller than 0.05% of image px
UNET_MORPH_KERNEL = 3                   # 3x3 kernel for open/close; set 0 to disable
UNET_SMOOTH_GAUSS = 1.0                 # gaussian sigma (in pixels) on the prob map; 0 to disable

TASK_DETECTION     = "detection"
TASK_SEG_INSTANCE  = "segmentation_instance"
TASK_SEG_SEMANTIC  = "segmentation_semantic"
RESULT_SCHEMA_VERSION = 2


# =========================
# Model registry (lazy)
# =========================

AVAILABLE_MODELS = {
    # YOLO detection (eager-load)
    "default":      {"task": TASK_DETECTION, "model": YOLO(YOLO_WEIGHTS)},
    "fast":         {"task": TASK_DETECTION, "model": YOLO(YOLO_WEIGHTS)},
    "accurate":     {"task": TASK_DETECTION, "model": YOLO(YOLO_WEIGHTS)},
    "experimental": {"task": TASK_DETECTION, "model": YOLO(YOLO_WEIGHTS)},
    # Segmentation (lazy)
    "maskrcnn": {"task": TASK_SEG_INSTANCE, "model": None, "weights": MASKRCNN_WEIGHTS},
    "unet":     {"task": TASK_SEG_SEMANTIC, "model": None, "weights": UNET_WEIGHTS},
}

# eval() for already-loaded models
for k, v in AVAILABLE_MODELS.items():
    if v["model"] is not None and hasattr(v["model"], "eval"):
        v["model"].eval()


# =========================
# Loaders (lazy)
# =========================

def load_maskrcnn(weights_path: str):
    model = maskrcnn_resnet50_fpn(weights=None, num_classes=2)
    sd = torch.load(weights_path, map_location="cpu")
    model.load_state_dict(sd, strict=False)
    model.eval()
    return model

def load_unet(weights_path: str):
    if not _HAS_SMP:
        raise RuntimeError("segmentation_models_pytorch is not installed on the server.")
    model = smp.Unet(
        encoder_name=UNET_ENCODER_NAME,   # match notebook
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
        entry["model"] = load_unet(entry["weights"])
    else:
        raise HTTPException(status_code=500, detail=f"Unknown lazy model '{name}'")


# =========================
# Rendering & result utils
# =========================

def draw_mask_overlay(
    rgb_np,
    mask_bin,
    fill_color=(255, 0, 0),     # red
    fill_alpha=0.7,
    line_color=(0, 255, 255),   # cyan
    line_thickness=3,
    draw_centroid=True,
):
    """
    High-visibility overlay for segmentation masks:
      - semi-transparent solid fill
      - cyan contour outline
      - optional centroid dot
    rgb_np: HxWx3 uint8 (RGB)
    mask_bin: HxW {0,1} or bool
    """
    if mask_bin is None or mask_bin.sum() == 0:
        return rgb_np

    base = rgb_np.copy()

    # filled overlay — broadcast via np.where (safe with HxWx1 mask)
    color_img = np.zeros_like(base, dtype=np.uint8)
    color_img[:] = np.array(fill_color, dtype=np.uint8)
    filled = cv2.addWeighted(base, 1.0 - fill_alpha, color_img, fill_alpha, 0)
    m3 = mask_bin.astype(bool)[..., None]
    base = np.where(m3, filled, base)

    # outline (contours) + centroids
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
    confs = [d["confidence"] for d in dets if d.get("confidence") is not None]
    return {
        "num_detections": len(dets),
        "class_counts": dict(class_counts),
        "confidence_mean": float(np.mean(confs)) if confs else 0.0,
        "confidence_max": float(np.max(confs)) if confs else 0.0,
        "image_size": {"width": int(img_w), "height": int(img_h)},
        "time_ms": timing_ms or {}
    }


# =========================
# Predictors (per task)
# =========================

def predict_maskrcnn(model, pil_img, score_thresh: float = MASKRCNN_SCORE_THRESH, mask_thresh: float = MASKRCNN_MASK_THRESH):
    """
    Mask R-CNN inference matching the notebook:
      - resize input to 256x256
      - keep instances with score >= 0.75
      - binarize masks at 0.5
      - resize masks back to original size for overlay/polygons/area
    """
    img = pil_img.convert("RGB")
    orig_h, orig_w = img.height, img.width

    # resize to (W,H) for the model (per notebook)
    resized = img.resize(MASKRCNN_INPUT_SIZE, Image.BILINEAR)
    tensor = TF.to_tensor(resized)  # 3xHxW in [0,1]

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
        masks  = masks.cpu().numpy()  # N x 1 x h x w  (here h,w = 256,256)
        labels = labels.cpu().numpy() if labels is not None else np.zeros_like(scores)

        keep = [i for i, s in enumerate(scores) if s >= float(score_thresh)]
        for i in keep:
            # mask at model resolution
            m_small = masks[i, 0]
            m_bin_small = (m_small > float(mask_thresh)).astype(np.uint8)

            # resize mask back to original image size
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

    # High-visibility overlay (red fill + cyan outline)
    overlay = draw_mask_overlay(np.array(img), union_mask,
                                fill_color=(255, 0, 0),
                                fill_alpha=0.7,
                                line_color=(0, 255, 255),
                                line_thickness=3)

    summary = build_summary(dets, orig_w, orig_h, timing_ms=infer_ms)
    result = {
        "schema": RESULT_SCHEMA_VERSION,
        "result_meta": {"task": TASK_SEG_INSTANCE},
        "detections": dets,
        "summary": summary
    }
    return overlay, result


def predict_unet(model, pil_img, thresh: float = None, class_idx: int = 0):
    """
    Robust U-Net inference:
     - optional resize to training size
     - encoder mean/std normalization (SMP params)
     - binary (sigmoid) or multi-class (softmax) support
     - gaussian smoothing, morphology open/close
     - min-area filtering to remove sparkle detections
    """
    if thresh is None:
        thresh = UNET_THRESHOLD

    img = pil_img.convert("RGB")
    H, W = img.height, img.width
    rgb = np.array(img)  # H x W x 3, uint8

    # --- optional resize to training size ---
    if UNET_INPUT_SIZE:
        resized = cv2.resize(rgb, UNET_INPUT_SIZE, interpolation=cv2.INTER_LINEAR)
    else:
        resized = rgb

    # --- SMP encoder normalization ---
    params = smp.encoders.get_preprocessing_params(UNET_ENCODER_NAME)
    mean = np.array(params["mean"], dtype=np.float32)
    std  = np.array(params["std"], dtype=np.float32)

    x = resized.astype(np.float32) / 255.0
    x = (x - mean) / std
    x = np.transpose(x, (2, 0, 1))[None, ...]     # 1x3xHxW
    x_t = torch.from_numpy(x)

    t0 = time.time()
    with torch.no_grad():
        out = model(x_t)
        if isinstance(out, (list, tuple)):
            out = out[0]

        # Handle binary vs multi-class heads:
        if out.shape[1] == 1:                     # binary
            probs_small = torch.sigmoid(out)[0, 0].cpu().numpy()
        else:                                     # multi-class
            probs_all = torch.softmax(out, dim=1)[0].cpu().numpy()  # CxHxW
            probs_small = probs_all[class_idx]     # choose the polyp class
    infer_ms = {"inference": (time.time() - t0) * 1000.0}

    # --- resize back to original size ---
    if UNET_INPUT_SIZE and (resized.shape[0] != H or resized.shape[1] != W):
        probs = cv2.resize(probs_small, (W, H), interpolation=cv2.INTER_LINEAR)
    else:
        probs = probs_small

    # --- optional smoothing ---
    if UNET_SMOOTH_GAUSS and UNET_SMOOTH_GAUSS > 0:
        probs = cv2.GaussianBlur(probs, ksize=(0, 0), sigmaX=UNET_SMOOTH_GAUSS)

    # --- threshold to binary mask ---
    mask_bin = (probs >= float(thresh)).astype(np.uint8)

    # --- optional morphology to remove speckles & close tiny holes ---
    if UNET_MORPH_KERNEL and UNET_MORPH_KERNEL >= 3:
        k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (UNET_MORPH_KERNEL, UNET_MORPH_KERNEL))
        mask_bin = cv2.morphologyEx(mask_bin, cv2.MORPH_OPEN,  k, iterations=1)
        mask_bin = cv2.morphologyEx(mask_bin, cv2.MORPH_CLOSE, k, iterations=1)

    # Connected components => per-region detections (with min-area filter)
    num, labels_cc = cv2.connectedComponents(mask_bin, connectivity=4)
    dets = []
    min_area = int(UNET_MIN_AREA_PCT * (H * W))
    if min_area < 1:
        min_area = 1

    for lab in range(1, num):
        region = (labels_cc == lab).astype(np.uint8)
        area = int(region.sum())
        if area < min_area:
            continue
        conf = float(probs[labels_cc == lab].mean())
        polys = _mask_to_polygons(region)
        dets.append({
            "detection_id": len(dets),
            "class_id": 0,
            "class_name": "polyp",
            "confidence": conf,
            "mask_area_px": area,
            "mask_polygons": polys
        })

    # Overlay (bright green fill + cyan outline)
    overlay = draw_mask_overlay(np.array(img), mask_bin,
                                fill_color=(0, 200, 0),
                                fill_alpha=0.7,
                                line_color=(0, 255, 255),
                                line_thickness=3)

    summary = build_summary(dets, W, H, timing_ms=infer_ms)
    result = {
        "schema": RESULT_SCHEMA_VERSION,
        "result_meta": {"task": TASK_SEG_SEMANTIC},
        "detections": dets,
        "summary": summary
    }
    return overlay, result



def yolo_result_to_dict(res, names: dict):
    """Standardized result for YOLO detection (and YOLO-seg if masks present)."""
    dets = []
    img_h, img_w = res.orig_shape if getattr(res, "orig_shape", None) else (-1, -1)

    boxes = getattr(res, "boxes", None)
    if boxes is not None and boxes.xyxy is not None:
        xyxy = boxes.xyxy.cpu().numpy()
        xywh = boxes.xywh.cpu().numpy()
        conf = boxes.conf.cpu().numpy() if boxes.conf is not None else None
        cls  = boxes.cls.cpu().numpy()  if boxes.cls  is not None else None

        for i in range(xyxy.shape[0]):
            cls_id = int(cls[i]) if cls is not None else -1
            w = float(xywh[i][2])
            h = float(xywh[i][3])
            dets.append({
                "detection_id": i,
                "class_id": cls_id,
                "class_name": names.get(cls_id, str(cls_id)),
                "confidence": float(conf[i]) if conf is not None else None,

                "bbox_xyxy": [float(v) for v in xyxy[i]],
                "bbox_xywh": [float(v) for v in xywh[i]],
                "bbox_area_px": round(w * h, 2),

                "bbox_xyxy_norm": [float(v) / img_w if idx % 2 == 0 else float(v) / img_h
                                   for idx, v in enumerate(xyxy[i])],
                "bbox_xywh_norm": [float(v) / img_w if idx % 2 == 0 else float(v) / img_h
                                   for idx, v in enumerate(xywh[i])],

                "aspect_ratio": round(w / h, 4) if h > 0 else None
            })

    # If YOLO-seg, include masks per detection
    if getattr(res, "masks", None) is not None and res.masks is not None and len(dets) == len(res.masks):
        masks = res.masks.data.cpu().numpy()
        for i in range(len(dets)):
            dets[i]["mask_area_px"] = int(masks[i].round().sum())
            try:
                polygons = res.masks.xy[i]
                dets[i]["mask_polygons"] = [list(map(float, p)) for p in polygons]
            except Exception:
                pass

    speed = getattr(res, "speed", {}) or {}
    summary = build_summary(dets, img_w, img_h, timing_ms={k: float(v) for k, v in speed.items()})

    return {
        "schema": RESULT_SCHEMA_VERSION,
        "result_meta": {"task": TASK_DETECTION},
        "detections": dets,
        "summary": summary
    }


# ======================
# FastAPI app + auth/db
# ======================

# MongoDB connection
load_dotenv()
MONGODB_URI = os.environ.get("MONGODB_URI")
if not MONGODB_URI:
    raise RuntimeError("MONGODB_URI not set in environment.")
client = AsyncIOMotorClient(MONGODB_URI)
db = client["polyp_detection"]
scans_collection = db["scans"]
users_collection = db["users"]

# FASTAPI initialization
app = FastAPI()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# CORS setup
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
    allow_headers=["*"],  # includes content-type, authorization
)

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
def hash_password(password: str) -> str:
    return pwd_context.hash(password)
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

# JWT
SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "dev_local_secret_change_me")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60
def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# Schemas
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


# ===============
# Auth Endpoints
# ===============
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
@app.get("/history")
async def get_upload_history(current_user: dict = Depends(get_current_user)):
    uploads = scans_collection.find({"user_id": str(current_user["_id"])})
    results = []
    async for upload in uploads:
        results.append({
            "patient_name": upload["patient_name"],
            "patient_id": upload["patient_id"],
            "datetime": upload["datetime"],
            "s3_url": upload["s3_url"],
            "processed_s3_url": upload["processed_s3_url"],
            "result": upload["result"],
            "notes": upload["notes"]
        })
    return results


# ==============================
# Upload (with model selection)
# ==============================
@app.post("/upload")
async def upload(
    files: List[UploadFile] = File(...),
    patient_name: str = Form(...),
    patient_id: str = Form(...),
    notes: str = Form(""),
    model_name: str = Form("default"),
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

        # original upload
        s3_url = s3.upload_to_s3(io.BytesIO(image_bytes), unique_filename)
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")

        # --- Predict based on task ---
        if task == TASK_DETECTION:
            preds = model.predict(image, verbose=False)
            res = preds[0]
            result_dict = yolo_result_to_dict(res, model.names)
            rendered = res.plot()  # ndarray
            processed_img = Image.fromarray(rendered)

        elif task == TASK_SEG_INSTANCE:
            overlay_np, result_dict = predict_maskrcnn(model, image)
            processed_img = Image.fromarray(overlay_np)

        elif task == TASK_SEG_SEMANTIC:
            overlay_np, result_dict = predict_unet(model, image)
            processed_img = Image.fromarray(overlay_np)

        else:
            raise HTTPException(status_code=500, detail=f"Unsupported task: {task}")

        # annotate result with model_name
        result_dict["result_meta"]["model_name"] = model_name

        # upload processed image
        buffer = io.BytesIO()
        processed_img.save(buffer, format="JPEG")
        buffer.seek(0)
        processed_s3_url = s3.upload_to_s3(buffer, "processed_" + unique_filename)

        # persist
        doc = {
            "user_id": str(current_user["_id"]),
            "user_email": current_user["email"],
            "patient_name": patient_name,
            "patient_id": patient_id,
            "datetime": datetime.utcnow().isoformat(),
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
# Misc Endpoints
# ===============
@app.get("/models")
async def get_models():
    return {"models": list(AVAILABLE_MODELS.keys())}


# ======================
# Admin-only Endpoints
# ======================
@app.put("/admin/users/{user_id}/promote")
async def promote_user(user_id: str, current_user: dict = Depends(admin_required)):
    from bson import ObjectId
    result = await users_collection.update_one({"_id": ObjectId(user_id)}, {"$set": {"is_admin": True}})
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


@app.delete("/admin/users/{user_id}")
async def delete_user(user_id: str, current_user: dict = Depends(admin_required)):
    from bson import ObjectId
    result = await users_collection.delete_one({"_id": ObjectId(user_id)})
    return {"deleted_count": result.deleted_count}


@app.get("/admin/uploads")
async def get_all_uploads(current_user: dict = Depends(admin_required)):
    cursor = scans_collection.find()
    uploads = []
    async for upload in cursor:
        upload["_id"] = str(upload["_id"])
        uploads.append(upload)
    return uploads


@app.delete("/admin/uploads/{upload_id}")
async def delete_upload(upload_id: str, current_user: dict = Depends(admin_required)):
    from bson import ObjectId
    result = await scans_collection.delete_one({"_id": ObjectId(upload_id)})
    return {"deleted_count": result.deleted_count}
