from datetime import datetime, timedelta
from PIL import Image
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from typing import List
from passlib.context import CryptContext
from fastapi import FastAPI, HTTPException, Depends, UploadFile, Form, File
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from pymongo import MongoClient
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from ultralytics import YOLO
from jose import jwt, JWTError
import numpy as np
import os
import s3
import uuid
import io

# Load model
model = YOLO("./model/best.pt")
model.eval()

# MongoDB connection
load_dotenv()
client = AsyncIOMotorClient(os.environ["MONGODB_URI"])
db = client["polyp_detection"]
scans_collection = db["scans"]
users_collection = db["users"]

#FASTAPI initialization
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
        "user_id": str(db_user["_id"])
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

# Profile
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
        "phone": current_user.get("phone", "")
    }

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
    return {"message": "Profile updated successfully."}


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


@app.post("/upload")
async def upload(
    files: List[UploadFile] = File(...),
    patient_name: str = Form(...),
    patient_id: str = Form(...),
    notes: str = Form(""),
    current_user: dict = Depends(get_current_user)
):
    upload_results = []

    for file in files:
        unique_filename = f"{uuid.uuid4()}_{file.filename}"

        # Read file bytes
        image_bytes = await file.read()

        # Upload original image
        s3_url = s3.upload_to_s3(io.BytesIO(image_bytes), unique_filename)

        # Open image
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")

        # Predict with YOLO
        results = model.predict(image)

        # Processed image (with annotations)
        rendered = results[0].plot()
        rendered_pil = Image.fromarray(rendered)

        # Save rendered image to BytesIO
        buffer = io.BytesIO()
        rendered_pil.save(buffer, format="JPEG")
        buffer.seek(0)

        # Upload processed image
        processed_s3_url = s3.upload_to_s3(buffer, "processed_" + unique_filename)

        # Prepare result labels
        detected_classes = [model.names[int(cls)] for cls in results[0].boxes.cls]
        confidences = [float(conf) for conf in results[0].boxes.conf]

        if detected_classes:
            result_label = ", ".join(
                [f"{cls} ({conf:.2f})" for cls, conf in zip(detected_classes, confidences)]
            )
        else:
            result_label = "No objects detected"

        # Store metadata in MongoDB
        await scans_collection.insert_one({
            "user_id": str(current_user["_id"]),
            "user_email": current_user["email"],
            "patient_name": patient_name,
            "patient_id": patient_id,
            "datetime": datetime.utcnow().isoformat(),
            "filename": unique_filename,
            "s3_url": s3_url,
            "processed_s3_url": processed_s3_url,
            "result": result_label,
            "notes": notes,
        })

        upload_results.append({
            "s3_url": s3_url,
            "processed_s3_url": processed_s3_url,
            "result": result_label,
        })

    return {
        "message": f"{len(upload_results)} files uploaded and scanned successfully.",
        "results": upload_results
    }