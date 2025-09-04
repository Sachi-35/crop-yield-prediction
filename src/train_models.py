import pandas as pd
import joblib
import os
import json
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import r2_score, mean_squared_error, mean_absolute_error
from xgboost import XGBRegressor
import numpy as np

# Paths
DATA_PATH = "data/final/master_table.csv"
MODELS_DIR = "models"
REPORTS_DIR = "reports"

os.makedirs(MODELS_DIR, exist_ok=True)
os.makedirs(REPORTS_DIR, exist_ok=True)

# Load data
df = pd.read_csv(DATA_PATH)

# Encode categorical variables (e.g., State, Crop, Season)
df = pd.get_dummies(df, drop_first=True)

# Features & target
X = df.drop(columns=["Yield"])
y = df["Yield"]

# Train-test split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# --- Helper: Evaluate model ---
def evaluate_model(model, X_test, y_test):
    y_pred = model.predict(X_test)
    return {
        "r2": r2_score(y_test, y_pred),
        "rmse": np.sqrt(mean_squared_error(y_test, y_pred)),
        "mae": mean_absolute_error(y_test, y_pred),
    }

# --- Train Random Forest ---
rf = RandomForestRegressor(random_state=42)
rf.fit(X_train, y_train)
rf_metrics = evaluate_model(rf, X_test, y_test)
joblib.dump(rf, os.path.join(MODELS_DIR, "random_forest.pkl"))

# --- Train XGBoost ---
xgb = XGBRegressor(random_state=42, n_estimators=100)
xgb.fit(X_train, y_train)
xgb_metrics = evaluate_model(xgb, X_test, y_test)
joblib.dump(xgb, os.path.join(MODELS_DIR, "xgboost.pkl"))

# --- Compare Models ---
results = {
    "RandomForest": rf_metrics,
    "XGBoost": xgb_metrics,
}

# Pick best model (higher R² preferred, then lower RMSE)
best_model_name = max(results, key=lambda m: (results[m]["r2"], -results[m]["rmse"]))

# Map model name to saved file
model_file_map = {
    "RandomForest": "random_forest.pkl",
    "XGBoost": "xgboost.pkl",
}

best_model_file = model_file_map[best_model_name]

# Save best model as "best_model.pkl"
best_model_path = os.path.join(MODELS_DIR, "best_model.pkl")
joblib.dump(joblib.load(os.path.join(MODELS_DIR, best_model_file)), best_model_path)

# --- Save Evaluation Report ---
report_path = os.path.join(REPORTS_DIR, "model_performance.json")
with open(report_path, "w") as f:
    json.dump(results, f, indent=4)

print("✅ Training complete!")
print("📊 Model performance:", results)
print(f"🏆 Best model: {best_model_name} (saved as best_model.pkl)")
