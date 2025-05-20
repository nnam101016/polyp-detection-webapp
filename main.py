# polyp_detect_app.py
import streamlit as st
from PIL import Image
import numpy as np
from ultralytics import YOLO          # ← Ultralytics loader
from util import set_background        # your helper for the BG image

# ── 1. Load YOLOv8 model ──────────────────────────────────────────
MODEL_PATH = "model/pest.pt"           # adjust path if needed
model = YOLO(MODEL_PATH)               # <-- nothing else required
model.fuse()                           # optional: a tiny speed boost

# ── 2. Streamlit UI ───────────────────────────────────────────────
set_background("./bgs/bg2.avif")       # optional aesthetic
st.title("Polyp Detection (YOLO v8)")
st.header("Upload an endoscopy frame and get detections")

file = st.file_uploader(
    "Choose a JPG / PNG", type=["jpg", "jpeg", "png"]
)

if file is not None:
    pil_img = Image.open(file).convert("RGB")
    st.image(pil_img, caption="Uploaded image", use_container_width=True)

    # ── 3. Inference ────────────────────────────────────────────
    # convert PIL → ndarray for Ultralytics
    img = np.array(pil_img)

    # predict() returns a list; we take first (and only) result
    res = model.predict(
        source=img,
        imgsz=640,        # inference size (can match training size)
        conf=0.25,        # confidence threshold
        verbose=False,
        stream=False
    )[0]

    # ── 4. Show annotated image ────────────────────────────────
    annotated = res.plot()            # draws boxes + labels on copy
    st.image(annotated, caption="Detections", use_container_width=True)

    # ── 5. Print table of detections ───────────────────────────
    if res.boxes:
        st.subheader("Detected objects")
        for box in res.boxes:
            cls_id   = int(box.cls[0])
            conf     = float(box.conf[0])
            label    = model.names[cls_id]
            xyxy     = box.xyxy[0].cpu().tolist()  # [x1,y1,x2,y2]
            st.write(
                f"• **{label}** – {conf:.2%}  |  "
                f"bbox: {list(map(int, xyxy))}"
            )
    else:
        st.info("No objects detected above the confidence threshold.")
