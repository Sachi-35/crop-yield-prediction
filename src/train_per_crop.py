import os
import joblib
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from xgboost import XGBRegressor
from sklearn.preprocessing import OneHotEncoder

# Paths
DATA_FILE = "data/final/master_table.csv"
MODELS_DIR = "models"

TARGET = "Yield"

def train_per_crop_models():
    # Load dataset
    df = pd.read_csv(DATA_FILE)

    # Ensure models directory exists
    os.makedirs(MODELS_DIR, exist_ok=True)

    crops = df["Crop"].unique()

    for crop in crops:
        print(f"\n🔄 Training models for crop: {crop}")

        crop_df = df[df["Crop"] == crop].copy()

        # Features / target
        X = crop_df.drop(columns=[TARGET, "Crop"])
        y = crop_df[TARGET]

        # Handle categorical features
        cat_cols = X.select_dtypes(include=["object"]).columns
        num_cols = X.select_dtypes(exclude=["object"]).columns

        encoder = OneHotEncoder(handle_unknown="ignore", sparse_output=False)
        X_cat = encoder.fit_transform(X[cat_cols]) if len(cat_cols) > 0 else None

        if X_cat is not None:
            X = pd.DataFrame(
                X_cat,
                columns=encoder.get_feature_names_out(cat_cols),
                index=X.index
            ).join(X[num_cols])

        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )

        # Train Random Forest
        rf = RandomForestRegressor(n_estimators=100, random_state=42)
        rf.fit(X_train, y_train)

        # Train XGBoost
        xgb = XGBRegressor(n_estimators=100, learning_rate=0.1, random_state=42)
        xgb.fit(X_train, y_train)

        # ✅ Define safe names & crop dir
        safe_crop_name = crop.replace("/", "_")
        crop_dir = os.path.join(MODELS_DIR, safe_crop_name)
        os.makedirs(crop_dir, exist_ok=True)

        # ✅ Save feature names for later use during inference
        feature_names_path = os.path.join(crop_dir, f"{safe_crop_name}_features.pkl")
        joblib.dump(X_train.columns.tolist(), feature_names_path)

        # ✅ Save models + encoder
        joblib.dump(rf, os.path.join(crop_dir, f"{safe_crop_name}_random_forest.pkl"))
        joblib.dump(xgb, os.path.join(crop_dir, f"{safe_crop_name}_xgboost.pkl"))
        joblib.dump(encoder, os.path.join(crop_dir, f"{safe_crop_name}_encoder.pkl"))

        print(f"✅ Models & features saved for {crop} in {crop_dir}")


if __name__ == "__main__":
    train_per_crop_models()
