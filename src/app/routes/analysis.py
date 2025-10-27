from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import joblib, os, pandas as pd, json
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse

router = APIRouter(tags=["Analysis"])

MODELS_DIR = "models"
DATA_FILE = "data/final/master_table.csv"
CONFIG_PATH = os.path.join(MODELS_DIR, "model_config.json")

class DescriptiveRequest(BaseModel):
    state: str
    crop: str
    year: int

class PredictiveRequest(BaseModel):
    state: str
    crop: str
    year: int
    rainfall_change: float
    fertilizer_change: float
    pesticide_change: float

# --- Helpers ---
def load_default_model():
    if os.path.exists(CONFIG_PATH):
        with open(CONFIG_PATH, "r") as f:
            config = json.load(f)
        model_file = config.get("default_model", "best_model.pkl")
    else:
        model_file = "best_model.pkl"

    model_path = os.path.join(MODELS_DIR, model_file)
    return joblib.load(model_path) if os.path.exists(model_path) else None

default_model = load_default_model()

@router.post("/descriptive")
def descriptive_analysis(request: DescriptiveRequest):
    # You may want to fetch historical/average data for the given state, crop, year
    # Example placeholder response:
    return {
        "state": request.state,
        "crop": request.crop,
        "year": request.year,
        "description": "Descriptive stats or historical yield here"
    }

@router.post("/predictive")
def predictive_analysis(request: PredictiveRequest):
    import pandas as pd
    import os
    import joblib

    # Load the master data file to fetch base values
    DATA_FILE = "data/final/master_table.csv"
    if not os.path.exists(DATA_FILE):
        raise HTTPException(status_code=404, detail="Master data file not found.")

    df = pd.read_csv(DATA_FILE)
    row = df[
        (df["State"] == request.state) &
        (df["Crop"] == request.crop) &
        (df["Year"] == request.year)
    ]

    if row.empty:
        raise HTTPException(status_code=404, detail="No data found for the given state, crop, and year.")

    # Take mean of Rainfall_x and Rainfall_y
    base_rainfall = float(row.iloc[0][["Rainfall_x", "Rainfall_y"]].mean())
    base_fertilizer = float(row.iloc[0]["Fertilizer_Total"])
    base_pesticide = float(row.iloc[0]["Pesticides"])

    # Apply percentage changes
    adjusted_rainfall = base_rainfall * (1 + request.rainfall_change / 100)
    adjusted_fertilizer = base_fertilizer * (1 + request.fertilizer_change / 100)
    adjusted_pesticide = base_pesticide * (1 + request.pesticide_change / 100)

    # Load model and encoder
    MODELS_DIR = "models"
    crop = request.crop
    safe_crop_name = crop.replace("/", "_")
    crop_dir = os.path.join(MODELS_DIR, safe_crop_name)

    try:
        model = joblib.load(os.path.join(crop_dir, f"{safe_crop_name}_random_forest.pkl"))
        encoder = joblib.load(os.path.join(crop_dir, f"{safe_crop_name}_encoder.pkl"))
        feature_names = joblib.load(os.path.join(crop_dir, f"{safe_crop_name}_features.pkl"))
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"No model found for crop {crop}")

    # Prepare input for prediction
    X = pd.DataFrame([{
        "State": request.state,
        "Year": request.year,
        "Rainfall": adjusted_rainfall,
        "Fertilizer": adjusted_fertilizer,
        "Pesticides": adjusted_pesticide
    }])

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
        X = X.reindex(columns=feature_names, fill_value=0)

    prediction = model.predict(X)[0]

    baseline_yield = float(row.iloc[0]["Yield"])

    return JSONResponse(content=jsonable_encoder({
        "state": request.state,
        "crop": request.crop,
        "year": request.year,
        "predicted_yield": float(prediction),
        "baseline_yield": float(baseline_yield),   # <-- include it
        "adjusted_inputs": {
            "rainfall": float(adjusted_rainfall),
            "fertilizer": float(adjusted_fertilizer),
            "pesticides": float(adjusted_pesticide)
        }
    }))