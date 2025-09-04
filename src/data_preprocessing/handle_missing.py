import pandas as pd
import os

# Paths
PROC_PATH = "data/processed/"
CLEAN_PATH = "data/cleaned/"
os.makedirs(CLEAN_PATH, exist_ok=True)

# ---------- Helper function ----------
def interpolate_state(df, value_cols):
    """
    Linear interpolation of missing values within each state (per column in value_cols)
    """
    df_sorted = df.sort_values(["State", "Year"])
    for col in value_cols:
        # Use transform instead of apply
        df_sorted[col] = df_sorted.groupby("State")[col].transform(lambda x: x.interpolate(method='linear'))
    return df_sorted


def fill_na_with_mean(df, value_cols, group_col="State"):
    """
    Fill remaining missing values with state mean or national mean
    """
    for col in value_cols:
        df[col] = df.groupby(group_col)[col].transform(lambda x: x.fillna(x.mean()))
        df[col] = df[col].fillna(df[col].mean())
    return df

# ---------- 1. Crop Yield ----------
def clean_crop_yield():
    df = pd.read_csv(PROC_PATH + "std_crop_yield.csv")

    value_cols = ["Yield", "Rainfall", "Fertilizer_N", "Pesticides"]

    # interpolate missing
    df = interpolate_state(df, value_cols)

    # fill remaining NAs
    df = fill_na_with_mean(df, value_cols)

    df.to_csv(CLEAN_PATH + "crop_yield_clean.csv", index=False)
    print("✅ Crop yield missing values handled")

# ---------- 2. District Crop ----------
def clean_district_crop():
    df = pd.read_csv(PROC_PATH + "std_district_crop.csv")

    # All crop columns
    crop_cols = [c for c in df.columns if "_Yield" in c]

    # interpolate
    df = interpolate_state(df, crop_cols)

    # fill remaining
    df = fill_na_with_mean(df, crop_cols)

    df.to_csv(CLEAN_PATH + "district_crop_clean.csv", index=False)
    print("✅ District crop missing values handled")

# ---------- 3. Fertilizer ----------
def clean_fertilizer():
    df = pd.read_csv(PROC_PATH + "std_fertilizers.csv")
    # Correct column names
    value_cols = ["Fertilizer_N", "Fertilizer_P", "Fertilizer_K", "Fertilizer_Total"]

    df = interpolate_state(df, value_cols)
    df = fill_na_with_mean(df, value_cols)

    df.to_csv(CLEAN_PATH + "fertilizer_clean.csv", index=False)
    print("✅ Fertilizer missing values handled")

# ---------- 4. Pesticides ----------
def clean_pesticides():
    df = pd.read_csv(PROC_PATH + "std_pesticides.csv")
    value_cols = ["Pesticides"]

    df = interpolate_state(df, value_cols)
    df = fill_na_with_mean(df, value_cols)

    df.to_csv(CLEAN_PATH + "pesticides_clean.csv", index=False)
    print("✅ Pesticides missing values handled")

# ---------- 5. Rainfall ----------
def clean_rainfall():
    df = pd.read_csv(PROC_PATH + "std_rainfall.csv")
    value_cols = ["Rainfall"]

    df = interpolate_state(df, value_cols)
    df = fill_na_with_mean(df, value_cols)

    df.to_csv(CLEAN_PATH + "rainfall_clean.csv", index=False)
    print("✅ Rainfall missing values handled")

# ---------- Run all ----------
if __name__ == "__main__":
    clean_crop_yield()
    clean_district_crop()
    clean_fertilizer()
    clean_pesticides()
    clean_rainfall()
    print("🎉 All missing values handled, cleaned files saved in data/cleaned/")