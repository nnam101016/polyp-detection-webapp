from datetime import datetime
from PIL import Image
from fastapi import FastAPI, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
from dotenv import load_dotenv
from tensorflow.keras.models import load_model
from ultralytics.nn.tasks import DetectionModel
from ultralytics import YOLO
import numpy as np
import os
import s3
import uuid
import io

# Load model
model = YOLO("./model/best.pt")
model.eval()


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
    unique_filename = f"{uuid.uuid4()}_{file.filename}"

    # Read file bytes
    image_bytes = file.file.read()

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
    scans_collection.insert_one({
        "patient_name": patient_name,
        "patient_id": patient_id,
        "datetime": datetime.utcnow().isoformat(),
        "filename": unique_filename,
        "s3_url": s3_url,
        "processed_s3_url": processed_s3_url,
        "result": result_label,
        "notes": notes,
    })
    
    print("Processed URL:", processed_s3_url)

    return {
        "s3_url": s3_url,
        "processed_s3_url": processed_s3_url,
        "result": result_label,
        "message": "File uploaded and scan completed"
    }