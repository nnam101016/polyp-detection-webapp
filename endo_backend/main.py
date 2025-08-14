from datetime import datetime, timedelta
from PIL import Image
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from typing import List
from passlib.context import CryptContext
from fastapi import FastAPI, HTTPException, Depends, UploadFile, Form, File
from pydantic import BaseModel, EmailStr
from pymongo import MongoClient
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from ultralytics import YOLO
from jose import jwt, JWTError
from collections import Counter
import numpy as np
import os
import s3
import uuid
import io

# --- Load multiple models ---
AVAILABLE_MODELS = {
    "default": YOLO("./model/best.pt"),
    "fast": YOLO("./model/best.pt"),       # e.g., smaller model
    "accurate": YOLO("./model/best.pt"), # e.g., larger model
    "experimental": YOLO("./model/best.pt")
}

for m in AVAILABLE_MODELS.values():
    m.eval()

# MongoDB connection
load_dotenv()
client = AsyncIOMotorClient(os.environ["MONGODB_URI"])
db = client["polyp_detection"]
scans_collection = db["scans"]
users_collection = db["users"]

# FASTAPI initialization
app = FastAPI()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

# JWT
SECRET_KEY = "your_secret_key_here"
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

#Convert to Dictionary
def yolo_result_to_dict(res, names: dict):
    dets = []

    boxes = getattr(res, "boxes", None)
    if boxes is not None and boxes.xyxy is not None:
        xyxy = boxes.xyxy.cpu().numpy()
        xywh = boxes.xywh.cpu().numpy()
        conf = boxes.conf.cpu().numpy() if boxes.conf is not None else None
        cls  = boxes.cls.cpu().numpy()  if boxes.cls  is not None else None

        img_h, img_w = res.orig_shape if getattr(res, "orig_shape", None) else (-1, -1)

        for i in range(xyxy.shape[0]):
            cls_id = int(cls[i]) if cls is not None else -1
            w = float(xywh[i][2])
            h = float(xywh[i][3])
            det = {
                "detection_id": i,
                "class_id": cls_id,
                "class_name": names.get(cls_id, str(cls_id)),
                "confidence": float(conf[i]) if conf is not None else None,

                # Bounding box formats
                "bbox_xyxy": [float(v) for v in xyxy[i]],
                "bbox_xywh": [float(v) for v in xywh[i]],
                "bbox_area_px": round(w * h, 2),

                # Normalized coords (0–1)
                "bbox_xyxy_norm": [float(v) / img_w if idx % 2 == 0 else float(v) / img_h 
                                    for idx, v in enumerate(xyxy[i])],
                "bbox_xywh_norm": [float(v) / img_w if idx % 2 == 0 else float(v) / img_h 
                                    for idx, v in enumerate(xywh[i])],

                # Aspect ratio
                "aspect_ratio": round(w / h, 4) if h > 0 else None
            }
            dets.append(det)

    # Masks
    if getattr(res, "masks", None) is not None and res.masks is not None and len(dets) == len(res.masks):
        masks = res.masks.data.cpu().numpy()
        for i in range(len(dets)):
            dets[i]["mask_area_px"] = int(masks[i].round().sum())
            # Optional: polygon points
            try:
                polygons = res.masks.xy[i]  # list of [x,y] coords
                dets[i]["mask_polygons"] = [list(map(float, p)) for p in polygons]
            except Exception:
                pass

    # Summary
    confs = [d["confidence"] for d in dets if d["confidence"] is not None]
    class_counts = Counter([d["class_name"] for d in dets])
    speed = getattr(res, "speed", {}) or {}

    summary = {
        "num_detections": len(dets),
        "class_counts": dict(class_counts),
        "confidence_mean": float(np.mean(confs)) if confs else 0.0,
        "confidence_max": float(np.max(confs)) if confs else 0.0,
        "image_size": {"width": int(img_w), "height": int(img_h)},
        "time_ms": {k: float(v) for k, v in speed.items()}
    }

    return {"detections": dets, "summary": summary}


# Register
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

# Login
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

# Get current user
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

# Admin role required
async def admin_required(current_user: dict = Depends(get_current_user)):
    if not current_user.get("is_admin", False):
        raise HTTPException(status_code=403, detail="Admin access only.")
    return current_user


# Profile
class UserUpdate(BaseModel):
    name: str = ""
    workplace: str = ""
    address: str = ""
    occupation: str = ""
    phone: str = ""

@app.put("/profile")
async def update_profile(
    update: UserUpdate,
    current_user: dict = Depends(get_current_user)
):
    await users_collection.update_one(
        {"_id": current_user["_id"]},
        {"$set": update.dict()}
    )

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

# Upload History
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


# --- Upload with model selection ---
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

    model = AVAILABLE_MODELS[model_name]
    upload_results = []

    for file in files:
        unique_filename = f"{uuid.uuid4()}_{file.filename}"
        image_bytes = await file.read()

        s3_url = s3.upload_to_s3(io.BytesIO(image_bytes), unique_filename)
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")

        preds = model.predict(image, verbose=False)
        res = preds[0]

        # Use dict (not JSON string)
        result_dict = yolo_result_to_dict(res, model.names)

        rendered = res.plot()
        buffer = io.BytesIO()
        Image.fromarray(rendered).save(buffer, format="JPEG")
        buffer.seek(0)
        processed_s3_url = s3.upload_to_s3(buffer, "processed_" + unique_filename)

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

# --- Models Endpoint ---
@app.get("/models")
async def get_models():
    return {"models": list(AVAILABLE_MODELS.keys())}

@app.put("/profile")
async def update_profile(update: UserUpdate, current_user: dict = Depends(get_current_user)):
    await users_collection.update_one({"_id": current_user["_id"]}, {"$set": update.dict()})
    return {"message": "Profile updated successfully."}

# Admin: Promote user
@app.put("/admin/users/{user_id}/promote")
async def promote_user(user_id: str, current_user: dict = Depends(admin_required)):
    from bson import ObjectId
    result = await users_collection.update_one({"_id": ObjectId(user_id)}, {"$set": {"is_admin": True}})
    return {"modified_count": result.modified_count}

# Admin: Stats overview
@app.get("/admin/stats")
async def get_admin_stats(current_user: dict = Depends(admin_required)):
    total_users = await users_collection.count_documents({})
    total_uploads = await scans_collection.count_documents({})
    return {"total_users": total_users, "total_uploads": total_uploads}

# Admin: View all users
@app.get("/admin/users")
async def get_all_users(current_user: dict = Depends(admin_required)):
    cursor = users_collection.find({}, {"hashed_password": 0})
    users = []
    async for user in cursor:
        user["_id"] = str(user["_id"])
        users.append(user)
    return users

# Admin: Delete user
@app.delete("/admin/users/{user_id}")
async def delete_user(user_id: str, current_user: dict = Depends(admin_required)):
    from bson import ObjectId
    result = await users_collection.delete_one({"_id": ObjectId(user_id)})
    return {"deleted_count": result.deleted_count}

# Admin: View all uploads
@app.get("/admin/uploads")
async def get_all_uploads(current_user: dict = Depends(admin_required)):
    cursor = scans_collection.find()
    uploads = []
    async for upload in cursor:
        upload["_id"] = str(upload["_id"])
        uploads.append(upload)
    return uploads

# Admin: Delete upload
@app.delete("/admin/uploads/{upload_id}")
async def delete_upload(upload_id: str, current_user: dict = Depends(admin_required)):
    from bson import ObjectId
    result = await scans_collection.delete_one({"_id": ObjectId(upload_id)})
    return {"deleted_count": result.deleted_count}
