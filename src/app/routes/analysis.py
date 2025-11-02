import numpy as np
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import joblib, os, pandas as pd, json
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from typing import Optional
from sklearn.metrics import mean_absolute_error, r2_score, mean_squared_error

router = APIRouter(tags=["Analysis"])

MODELS_DIR = "models"
DATA_FILE = "data/final/master_table.csv"
CONFIG_PATH = os.path.join(MODELS_DIR, "model_config.json")


# ---------------------------- Request Schemas ----------------------------
class DescriptiveRequest(BaseModel):
    state: str
    crop: str
    year: Optional[int] = None  # for backward compatibility
    start_year: Optional[int] = None
    end_year: Optional[int] = None


class PredictiveRequest(BaseModel):
    state: str
    crop: str
    year: Optional[int] = None
    rainfall_change: float = 0.0
    fertilizer_change: float = 0.0
    pesticide_change: float = 0.0


# ---------------------------- Helper Functions ----------------------------
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


# ---------------------------- Descriptive Endpoint ----------------------------
@router.post("/descriptive")
def descriptive_analysis(request: DescriptiveRequest):
    return {
        "state": request.state,
        "crop": request.crop,
        "year": request.year,
        "description": "Descriptive stats or historical yield here"
    }


# ---------------------------- Predictive Endpoint ----------------------------
@router.post("/predictive")
def predictive_analysis(request: PredictiveRequest):
    # Load dataset
    if not os.path.exists(DATA_FILE):
        raise HTTPException(status_code=404, detail="Master data file not found.")

    df = pd.read_csv(DATA_FILE)

    # --- Auto fallback: use latest year if not provided ---
    if request.year is None:
        filtered = df[(df["State"] == request.state) & (df["Crop"] == request.crop)]
        if filtered.empty:
            raise HTTPException(
                status_code=404,
                detail=f"Information not available: {request.crop} is not grown in {request.state} or data is unavailable."
            )
        request.year = int(filtered["Year"].max())

    # --- Find exact record for crop/state/year ---
    row = df[
        (df["State"] == request.state) &
        (df["Crop"] == request.crop) &
        (df["Year"] == request.year)
    ]

    if row.empty:
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
            available_years = sorted(combo_exists["Year"].unique().tolist())
            raise HTTPException(
                status_code=404,
                detail=f"No data for {request.crop} in {request.state} for year {request.year}. Available years: {available_years}"
            )

    # --- Extract and adjust input features ---
    base_rainfall = float(row.iloc[0][["Rainfall_x", "Rainfall_y"]].mean())
    base_fertilizer = float(row.iloc[0]["Fertilizer_Total"])
    base_pesticide = float(row.iloc[0]["Pesticides"])

    adjusted_rainfall = base_rainfall * (1 + request.rainfall_change / 100)
    adjusted_fertilizer = base_fertilizer * (1 + request.fertilizer_change / 100)
    adjusted_pesticide = base_pesticide * (1 + request.pesticide_change / 100)

    # --- Load model and encoder ---
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

    # --- Prepare input for prediction ---
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

    # --- Prediction ---
    prediction = model.predict(X)[0]
    baseline_yield = float(row.iloc[0]["Yield"])

    # --- Confidence (mocked for now) ---
    confidence = 0.85 + (abs(hash(f"{request.state}{request.crop}")) % 15) / 100

    # --- Validation metrics (MAE, R², RMSE) ---
    try:
        X_all = df[(df["Crop"] == request.crop) & (df["State"] == request.state)]
        if not X_all.empty:
            y_true = X_all["Yield"]

            # Prepare features similarly for validation
            X_temp = X_all[["State", "Year", "Rainfall_x", "Rainfall_y", "Fertilizer_Total", "Pesticides"]].copy()
            X_temp["Rainfall"] = X_temp[["Rainfall_x", "Rainfall_y"]].mean(axis=1)
            X_temp = X_temp.drop(columns=["Rainfall_x", "Rainfall_y", "Fertilizer_Total", "Pesticides"])
            X_temp["Fertilizer"] = base_fertilizer
            X_temp["Pesticides"] = base_pesticide

            if encoder is not None:
                cat_cols = X_temp.select_dtypes(include=["object"]).columns
                num_cols = X_temp.select_dtypes(exclude=["object"]).columns
                if len(cat_cols) > 0:
                    X_cat = encoder.transform(X_temp[cat_cols])
                    X_temp = pd.DataFrame(
                        X_cat,
                        columns=encoder.get_feature_names_out(cat_cols),
                        index=X_temp.index
                    ).join(X_temp[num_cols])
                X_temp = X_temp.reindex(columns=feature_names, fill_value=0)

            y_pred = model.predict(X_temp)

            mae = float(mean_absolute_error(y_true, y_pred))
            r2 = float(r2_score(y_true, y_pred))
            rmse = float(np.sqrt(mean_squared_error(y_true, y_pred)))
        else:
            mae, r2, rmse = 0.0, 0.0, 0.0
    except Exception as e:
        print(f"⚠️ Validation metric error: {e}")
        mae, r2, rmse = 0.0, 0.0, 0.0

     # --- Optional: Scenario flag and yield difference ---
    scenario_flag = (
        request.rainfall_change != 0.0 or
        request.fertilizer_change != 0.0 or
        request.pesticide_change != 0.0
    )

    yield_difference = float(prediction) - float(baseline_yield)
    percent_change = (yield_difference / baseline_yield) * 100 if baseline_yield != 0 else 0

    # --- Final Response ---
    return JSONResponse(content=jsonable_encoder({
        "state": request.state,
        "crop": request.crop,
        "year": request.year,
        "yield": float(prediction),
        "predicted_yield": float(prediction),
        "baseline_yield": float(baseline_yield),
        "confidence": float(confidence),
        "adjusted_inputs": {
            "rainfall": float(adjusted_rainfall),
            "fertilizer": float(adjusted_fertilizer),
            "pesticides": float(adjusted_pesticide)
        },
        "metrics": {
            "mae": mae,
            "r2": r2,
            "rmse": rmse
        },
        "scenario": scenario_flag,
        "yield_difference": yield_difference,
        "percent_change": percent_change
    }))

# ---------------------------- Historical Endpoint ----------------------------
@router.post("/historical")
def historical_analysis(request: DescriptiveRequest):
    import pandas as pd
    from fastapi import HTTPException

    if not os.path.exists(DATA_FILE):
        raise HTTPException(status_code=404, detail="Master data file not found.")

    df = pd.read_csv(DATA_FILE)

    # Filter data for given state and crop
    crop_data = df[(df["State"] == request.state) & (df["Crop"] == request.crop)]

    # Filter by year range if provided
    if request.start_year and request.end_year:
        crop_data = crop_data[
            (crop_data["Year"] >= request.start_year) &
            (crop_data["Year"] <= request.end_year)
        ]

    if crop_data.empty:
        raise HTTPException(
            status_code=404,
            detail=f"No data available for {request.crop} in {request.state}"
        )

    # Ensure sorting by Year
    crop_data = crop_data.sort_values("Year")
    available_years = crop_data["Year"].tolist()

    # --- Compute best year ---
    best_row = crop_data.loc[crop_data["Yield"].idxmax()]
    best_year = int(best_row["Year"])
    best_yield = float(best_row["Yield"])

    # --- Adjust year if not present ---
    year = request.year or int(crop_data["Year"].max())

    if year not in available_years:
        nearest_year = crop_data.iloc[(crop_data["Year"] - year).abs().argsort()[:1]]["Year"].values[0]
        year = int(nearest_year)

    # --- Compute 5-year average ---
    prev_years = [y for y in available_years if y < year]
    if len(prev_years) >= 5:
        sample_years = prev_years[-5:]
    else:
        sample_years = sorted(available_years, key=lambda y: abs(y - year))[:5]

    nearby_data = crop_data[crop_data["Year"].isin(sample_years)]
    five_year_avg = float(nearby_data["Yield"].mean()) if not nearby_data.empty else None

    # --- Current year yield ---
    current_yield = None
    if year in crop_data["Year"].values:
        current_yield = float(crop_data[crop_data["Year"] == year]["Yield"].values[0])

    comparison = None
    percent_diff = None
    if five_year_avg and current_yield:
        percent_diff = round(((current_yield - five_year_avg) / five_year_avg) * 100, 2)
        if current_yield > five_year_avg:
            comparison = f"↑ {abs(percent_diff)}% above average"
        elif current_yield < five_year_avg:
            comparison = f"↓ {abs(percent_diff)}% below average"
        else:
            comparison = "Equal to 5-year average"

    # --- Growth Trend (annual change % using linear regression) ---
    if len(crop_data) > 1:
        years = crop_data["Year"].values
        yields = crop_data["Yield"].values
        coeffs = np.polyfit(years, yields, 1)  # linear fit
        slope = coeffs[0]
        mean_yield = np.mean(yields)
        annual_growth = (slope / mean_yield) * 100 if mean_yield != 0 else 0
        growth_trend = round(annual_growth, 2)
        trend_direction = "📈 Growing" if growth_trend > 0 else "📉 Declining"
    else:
        growth_trend, trend_direction = 0, "Insufficient data"

    # --- Trend Data for chart (normalized keys: lowercase) ---
    trend_data = crop_data[
    ["Year", "Yield", "Rainfall_x", "Rainfall_y", "Fertilizer_Total", "Pesticides"]
    ].copy()

    # Average rainfall_x and rainfall_y into one value
    trend_data["Rainfall"] = trend_data[["Rainfall_x", "Rainfall_y"]].mean(axis=1)

    trend_data = trend_data.rename(columns={
        "Year": "year",
        "Yield": "yield",
        "Rainfall": "rainfall",
        "Fertilizer_Total": "fertilizer",
        "Pesticides": "pesticide"
    })[["year", "yield", "rainfall", "fertilizer", "pesticide"]].to_dict(orient="records")

    # --- Correlation Analysis ---
    try:
        correlation_data = {
            "rainfall_yield": round(float(crop_data["Rainfall_x"].corr(crop_data["Yield"])), 3)
            if "Rainfall_x" in crop_data and not crop_data["Rainfall_x"].isnull().all() else None,
            "fertilizer_yield": round(float(crop_data["Fertilizer_Total"].corr(crop_data["Yield"])), 3)
            if "Fertilizer_Total" in crop_data and not crop_data["Fertilizer_Total"].isnull().all() else None,
            "pesticide_yield": round(float(crop_data["Pesticides"].corr(crop_data["Yield"])), 3)
            if "Pesticides" in crop_data and not crop_data["Pesticides"].isnull().all() else None
        }
    except Exception as e:
        print("⚠️ Correlation calculation error:", e)
        correlation_data = None

    return JSONResponse(content=jsonable_encoder({
        "state": request.state,
        "crop": request.crop,
        "year": year,
        "five_year_average": five_year_avg,
        "sample_years": sample_years,
        "comparison": comparison,
        "percent_difference": percent_diff,
        "best_year": best_year,
        "best_yield": best_yield,
        "growth_trend": {
            "annual_rate": growth_trend,
            "direction": trend_direction
        },
        "trend_data": trend_data,
        "available_years": available_years,
        "correlation_data": correlation_data
    }))

# ---------------------------- Scenario Simulation Endpoint ----------------------------
@router.post("/scenario")
def simulate_scenario(request: PredictiveRequest):
    try:
        baseline_yield = float(request.rainfall_change or 0)  # placeholder safety
        if not hasattr(request, "baseline_yield"):
            baseline_yield = 0.0

        # We'll actually get it from body if frontend passes it
        data = request.dict()
        baseline_yield = float(data.get("baseline_yield", 0))
        rainfall_change = float(data.get("rainfall_change", 0))
        fertilizer_change = float(data.get("fertilizer_change", 0))
        pesticide_change = float(data.get("pesticide_change", 0))

        # --- Simple linear simulation model ---
        yield_change = (0.3 * rainfall_change + 0.4 * fertilizer_change - 0.2 * pesticide_change) / 100
        predicted_yield = baseline_yield * (1 + yield_change)

        # --- Confidence based on the total variation ---
        variation_intensity = abs(rainfall_change) + abs(fertilizer_change) + abs(pesticide_change)
        confidence = max(50, 95 - variation_intensity * 0.2)

        # --- Simple risk label ---
        if confidence > 85:
            risk = "Low Risk"
        elif confidence > 70:
            risk = "Moderate Risk"
        else:
            risk = "High Risk"

        return JSONResponse(content=jsonable_encoder({
            "predicted_yield": round(predicted_yield, 3),
            "confidence": round(confidence, 1),
            "risk": risk
        }))

    except Exception as e:
        print("Scenario simulation error:", e)
        raise HTTPException(status_code=500, detail="Simulation failed")