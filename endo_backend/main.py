from datetime import datetime
from fastapi import FastAPI, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
from dotenv import load_dotenv
import os
import s3
import uuid

# MongoDB connection
client = MongoClient(os.environ["MONGODB_URI"])
db = client["polyp_detection"]
scans_collection = db["scans"]

app = FastAPI()

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/upload")
def upload(
    file: UploadFile,
    patient_name: str = Form(...),
    patient_id: str = Form(...),
    notes: str = Form(""),
):
    # Generate unique filename
    unique_filename = f"{uuid.uuid4()}_{file.filename}"

    # Upload to S3
    s3_url = s3.upload_to_s3(file.file, unique_filename)

    # Save metadata
    scans_collection.insert_one({
        "patient_name": patient_name,
        "patient_id": patient_id,
        "datetime": datetime.utcnow().isoformat(),
        "filename": unique_filename,
        "s3_url": s3_url,
        "result": "pending",
        "notes": notes,
    })

    return {"s3_url": s3_url, "message": "File uploaded successfully"}
