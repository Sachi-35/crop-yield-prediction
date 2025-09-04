import pandas as pd
import os
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
import joblib
import numpy as np
import re  # add this

MODEL_PATH = "models/"
os.makedirs(MODEL_PATH, exist_ok=True)

# Encode states for models
def encode_states(df):
    states = df["State"].unique()
    state_to_int = {state: i for i, state in enumerate(states)}
    df["State_encoded"] = df["State"].map(state_to_int)
    return df, state_to_int

def train_crop_model(df, crop_name):
    # Filter crop rows
    crop_df = df[df["Crop"] == crop_name].copy()
    
    # Ensure State_encoded exists
    if "State_encoded" not in crop_df.columns:
        crop_df, state_map = encode_states(crop_df)
    else:
        state_map = {s: s for s in crop_df["State"].unique()}
    
    # Handle Rainfall column safely
    if "Rainfall_x" in crop_df.columns and "Rainfall_y" in crop_df.columns:
        crop_df["Rainfall"] = crop_df[["Rainfall_x", "Rainfall_y"]].mean(axis=1)
    elif "Rainfall_x" in crop_df.columns:
        crop_df["Rainfall"] = crop_df["Rainfall_x"]
    elif "Rainfall_y" in crop_df.columns:
        crop_df["Rainfall"] = crop_df["Rainfall_y"]
    elif "Rainfall" not in crop_df.columns:
        crop_df["Rainfall"] = 0  # fallback if missing
    
    # Features & target
    feature_cols = ["State_encoded", "Year", "Rainfall", "Fertilizer_Total", "Pesticides"]
    missing_cols = [col for col in feature_cols if col not in crop_df.columns]
    if missing_cols:
        raise KeyError(f"Missing columns for crop {crop_name}: {missing_cols}")
    
    X = crop_df[feature_cols]
    y = crop_df["Yield"]
    
    # Train-test split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Train Random Forest
    model = RandomForestRegressor(n_estimators=200, random_state=42)
    model.fit(X_train, y_train)
    
    # Save model (sanitize filename)
    safe_name = crop_name.replace("/", "_").replace("\\", "_")
    joblib.dump(model, f"{MODEL_PATH}{safe_name}_model.pkl")
    
    return state_map

# Load model for prediction
def load_model(crop_name):
    safe_crop_name = re.sub(r'[^\w\d-]', '_', crop_name)
    model_file = f"{MODEL_PATH}{safe_crop_name}_model.pkl"
    if not os.path.exists(model_file):
        raise FileNotFoundError(f"Model for {crop_name} not found. Train first!")
    return joblib.load(model_file)
