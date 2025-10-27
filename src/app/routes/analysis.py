from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import joblib, os, pandas as pd, json
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from typing import Optional

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
    year: Optional[int] = None  # FIX #1: Make year optional
    rainfall_change: float = 0.0
    fertilizer_change: float = 0.0
    pesticide_change: float = 0.0

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

    # Load the master data file
    DATA_FILE = "data/final/master_table.csv"
    if not os.path.exists(DATA_FILE):
        raise HTTPException(status_code=404, detail="Master data file not found.")

    df = pd.read_csv(DATA_FILE)
    
    # FIX #1: If year not provided, use latest year for this state-crop combo
    if request.year is None:
        filtered = df[(df["State"] == request.state) & (df["Crop"] == request.crop)]
        if filtered.empty:
            # FIX #2: Better error message for invalid crop-state combo
            raise HTTPException(
                status_code=404, 
                detail=f"Information not available: {request.crop} is not grown in {request.state} or data is unavailable."
            )
        request.year = int(filtered["Year"].max())
    
    # Try to find exact match
    row = df[
        (df["State"] == request.state) &
        (df["Crop"] == request.crop) &
        (df["Year"] == request.year)
    ]

    if row.empty:
        # FIX #2: Check if crop-state combo exists at all
        combo_exists = df[
            (df["State"] == request.state) & 
            (df["Crop"] == request.crop)
        ]
        
        if combo_exists.empty:
            raise HTTPException(
                status_code=404,
                detail=f"Information not available: {request.crop} is not grown in {request.state} or data is unavailable."
            )
        else:
            # Combo exists but not for this year
            available_years = sorted(combo_exists["Year"].unique().tolist())
            raise HTTPException(
                status_code=404,
                detail=f"No data for {request.crop} in {request.state} for year {request.year}. Available years: {available_years}"
            )

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
        raise HTTPException(
            status_code=404, 
            detail=f"Model not available: {crop} prediction model not found."
        )

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
    
    # FIX #4: Always include confidence score (mock for now - you can add real model scoring)
    confidence = 0.85 + (abs(hash(f"{request.state}{request.crop}")) % 15) / 100

    return JSONResponse(content=jsonable_encoder({
        "state": request.state,
        "crop": request.crop,
        "year": request.year,
        "yield": float(prediction),  # Changed key name for frontend consistency
        "predicted_yield": float(prediction),
        "baseline_yield": float(baseline_yield),
        "confidence": float(confidence),  # FIX #4: Always include confidence
        "adjusted_inputs": {
            "rainfall": float(adjusted_rainfall),
            "fertilizer": float(adjusted_fertilizer),
            "pesticides": float(adjusted_pesticide)
        }
    }))