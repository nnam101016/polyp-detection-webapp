from fastapi import FastAPI, Form, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
import auth, s3

# MongoDB connection
client = MongoClient("mongodb+srv://nnam101016:fXs7ZJ96ximXjve6@cluster0.mapfokh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
db = client["polyp_detection"]
users_collection = db["users"]
scans_collection = db["scans"]

app = FastAPI()

# Allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/register")
def register(username: str = Form(...), password: str = Form(...)):
    if users_collection.find_one({"username": username}):
        raise HTTPException(status_code=400, detail="Username already exists")
    hashed_pw = auth.get_password_hash(password)
    users_collection.insert_one({"username": username, "hashed_password": hashed_pw})
    return {"message": "User created"}

@app.post("/login")
def login(username: str = Form(...), password: str = Form(...)):
    user = users_collection.find_one({"username": username})
    if not user or not auth.verify_password(password, user["hashed_password"]):
        raise HTTPException(status_code=400, detail="Invalid credentials")
    token = auth.create_access_token({"sub": username})
    return {"access_token": token}

@app.post("/upload")
def upload(file: UploadFile, token: str = Form(...)):
    payload = auth.decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    username = payload.get("sub")

    # Upload to S3
    s3_url = s3.upload_to_s3(file.file, file.filename)

    # Store record in MongoDB
    scans_collection.insert_one({
        "username": username,
        "filename": file.filename,
        "s3_url": s3_url,
        "result": "pending"
    })

    return {"s3_url": s3_url, "message": "File uploaded and record created"}
