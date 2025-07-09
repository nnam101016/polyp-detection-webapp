import streamlit as st
import pandas as pd
import tensorflow as tf
from tensorflow import keras
load_model = keras.models.load_model
from PIL import Image
import numpy as np
import h5py  # Library for editing HDF5 files
from util import set_background

# Function to remove 'groups' key from the model config in H5 file
def fix_h5_file(h5_path):
    with h5py.File(h5_path, mode="r+") as f:
        model_config_string = f.attrs.get("model_config")
        if model_config_string and '"groups": 1,' in model_config_string:
            model_config_string = model_config_string.replace('"groups": 1,', '')
            f.attrs.modify('model_config', model_config_string)
            f.flush()
            assert '"groups": 1,' not in f.attrs.get("model_config")

# Path to the model file
MODEL_PATH = "model\polyp_classifier.h5"  # Update the path if needed

# Apply fix before loading
fix_h5_file(MODEL_PATH)

# Load the modified model
model = load_model(MODEL_PATH, compile=False)

# Preprocessing function
def preprocess_image(image, target_size):
    image = image.convert("RGB")  # Ensure image is in RGB format
    image = image.resize(target_size)
    image = np.array(image) / 255.0  # Normalize
    image = np.expand_dims(image, axis=0)  # Add batch dimension
    return image

# Streamlit UI
st.set_page_config(page_title="Polyp Classification")

set_background('./bgs/bg2.avif')
st.title('Polyp classification')
st.header("Upload an image and let the model predict!")

st.sidebar.success("Change pages here.")# add side bar and change other page name with number_pageName to manually sort order

uploaded_file = st.file_uploader("Choose an image...", type=["jpg", "png", "jpeg"])

if "table_data" not in st.session_state:
    st.session_state["table_data"] = None

if uploaded_file:
    image = Image.open(uploaded_file)
    st.image(image, caption="Uploaded Image", use_container_width=True)

    # Dictionary to map labels to meaningful names
    class_labels = {0: "Negative", 1: "Positive"}

    # Preprocess image
    processed_image = preprocess_image(image, target_size=(224, 224))  # Adjust based on model input size
    #debug the image shape
    print("Processed image shape:", processed_image.shape)
    print("Model input shape:", model.input_shape)
    print("Model loaded:", model is not None)
    # Get predictions
    predictions = model.predict(processed_image)

    # Define class labels
    class_labels = np.array(["Negative", "Positive"])

    # Convert predictions into a labeled DataFrame
    df = pd.DataFrame(predictions, columns=class_labels)

    # Convert DataFrame to styled HTML table without the index column
    html_table = df.style.hide(axis="index").to_html()
    st.session_state["table_data"] = html_table
    st.write("**Analysis completed**")

st.button("Go to Analysis", on_click=lambda: st.session_state["table_data"] is not None, key="go_to_analysis")

if st.button("Go to Analysis"):
    if st.session_state["table_data"] is not None:
        st.session_state["table_data"] = st.session_state["table_data"]
        st.experimental_rerun()
    else:
        st.warning("Please upload an image first.")