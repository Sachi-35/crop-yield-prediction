from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import joblib
import os
import pandas as pd
import json

router = APIRouter(tags=["Analysis"])

# Paths
MODELS_DIR = "models"
DATA_FILE = "data/final/master_table.csv"
CONFIG_PATH = os.path.join(MODELS_DIR, "model_config.json")

# --- Request schema (flat structure for easy testing) ---
class SimulationRequest(BaseModel):
    state: str
    crop: str
    year: int
    rainfall: float
    fertilizer: float
    pesticides: float
    rainfall_change: float = 0.0
    fertilizer_change: float = 0.0
    pesticides_change: float = 0.0


# --- Default model loader (global fallback if per-crop model missing) ---
def load_default_model():
    if os.path.exists(CONFIG_PATH):
        with open(CONFIG_PATH, "r") as f:
            config = json.load(f)
        model_file = config.get("default_model", "best_model.pkl")
    else:
        model_file = "best_model.pkl"  # fallback

    model_path = os.path.join(MODELS_DIR, model_file)
    if os.path.exists(model_path):
        return joblib.load(model_path)
    return None


default_model = load_default_model()


@router.post("/simulate")
def simulate(request: SimulationRequest):
    crop = request.crop
    safe_crop_name = crop.replace("/", "_")
    crop_dir = os.path.join(MODELS_DIR, safe_crop_name)

    # --- Try per-crop model first ---
    try:
        model_path = os.path.join(crop_dir, f"{safe_crop_name}_random_forest.pkl")
        encoder_path = os.path.join(crop_dir, f"{safe_crop_name}_encoder.pkl")
        feature_names_path = os.path.join(crop_dir, f"{safe_crop_name}_features.pkl")

        model = joblib.load(model_path)
        encoder = joblib.load(encoder_path)
        feature_names = joblib.load(feature_names_path)
    except FileNotFoundError:
        if default_model is None:
            raise HTTPException(status_code=404, detail=f"No model found for crop: {crop} and no default model available")
        # Fallback to default
        model = default_model
        encoder = None
        feature_names = None

    # Apply adjustments
    adjusted_rainfall = request.rainfall * (1 + request.rainfall_change / 100)
    adjusted_fertilizer = request.fertilizer * (1 + request.fertilizer_change / 100)
    adjusted_pesticides = request.pesticides * (1 + request.pesticides_change / 100)

    # Build feature row
    input_data = {
        "State": request.state,
        "Year": request.year,
        "Rainfall": adjusted_rainfall,
        "Fertilizer": adjusted_fertilizer,
        "Pesticides": adjusted_pesticides
    }

    X = pd.DataFrame([input_data])

    if encoder is not None:
        cat_cols = X.select_dtypes(include=["object"]).columns
        num_cols = X.select_dtypes(exclude=["object"]).columns

        if len(cat_cols) > 0:
            X_cat = encoder.transform(X[cat_cols])
            X = pd.DataFrame(
                X_cat,
                columns=encoder.get_feature_names_out(cat_cols),
                index=X.index
            ).join(X[num_cols])

        # Align with training features
        X = X.reindex(columns=feature_names, fill_value=0)

    prediction = model.predict(X)[0]

    return {
        "crop": crop,
        "original_inputs": {
            "rainfall": request.rainfall,
            "fertilizer": request.fertilizer,
            "pesticides": request.pesticides
        },
        "adjustments": {
            "rainfall_change": request.rainfall_change,
            "fertilizer_change": request.fertilizer_change,
            "pesticides_change": request.pesticides_change
        },
        "adjusted_inputs": {
            "rainfall": adjusted_rainfall,
            "fertilizer": adjusted_fertilizer,
            "pesticides": adjusted_pesticides
        },
        "predicted_yield": float(prediction)
    }