from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import joblib
import os
import pandas as pd

router = APIRouter(tags=["Analysis"])

# Paths
MODELS_DIR = "models"

# --- Request schema (FLAT) ---
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


@router.post("/simulate")
def simulate(request: SimulationRequest):
    crop = request.crop
    safe_crop_name = crop.replace("/", "_")
    crop_dir = os.path.join(MODELS_DIR, safe_crop_name)

    try:
        model_path = os.path.join(crop_dir, f"{safe_crop_name}_random_forest.pkl")
        encoder_path = os.path.join(crop_dir, f"{safe_crop_name}_encoder.pkl")
        features_path = os.path.join(crop_dir, f"{safe_crop_name}_features.pkl")

        model = joblib.load(model_path)
        encoder = joblib.load(encoder_path)
        feature_names = joblib.load(features_path)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"No model found for crop: {crop}")

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
        "Pesticides": adjusted_pesticides,
    }

    X = pd.DataFrame([input_data])

    # Handle categorical encoding
    cat_cols = X.select_dtypes(include=["object"]).columns
    num_cols = X.select_dtypes(exclude=["object"]).columns

    if len(cat_cols) > 0:
        X_cat = encoder.transform(X[cat_cols])
        X = pd.DataFrame(
            X_cat,
            columns=encoder.get_feature_names_out(cat_cols),
            index=X.index
        ).join(X[num_cols])

    # ✅ Align columns with training feature set
    X = X.reindex(columns=feature_names, fill_value=0)

    prediction = model.predict(X)[0]

    return {
        "crop": crop,
        "original_inputs": {
            "rainfall": request.rainfall,
            "fertilizer": request.fertilizer,
            "pesticides": request.pesticides,
        },
        "adjustments": {
            "rainfall_change": request.rainfall_change,
            "fertilizer_change": request.fertilizer_change,
            "pesticides_change": request.pesticides_change,
        },
        "adjusted_inputs": {
            "rainfall": adjusted_rainfall,
            "fertilizer": adjusted_fertilizer,
            "pesticides": adjusted_pesticides,
        },
        "predicted_yield": float(prediction),
    }
