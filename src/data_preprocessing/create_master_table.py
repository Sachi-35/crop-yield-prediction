import pandas as pd
import os

FINAL_PATH = "data/final/"
OUTPUT_PATH = "data/final/"
os.makedirs(OUTPUT_PATH, exist_ok=True)

def clean_scientific_notation(df):
    """Fix columns that have been read in scientific notation but are valid yields."""
    sci_cols = [
        "BARLEY_YIELD_Kg_per_ha",
        "LINSEED_YIELD_Kg_per_ha",
        "SOYABEAN_YIELD_Kg_per_ha"
    ]
    
    for col in sci_cols:
        if col in df.columns:
            # Convert to float, drop truly missing
            df[col] = pd.to_numeric(df[col], errors="coerce")
            # Replace extremely tiny values (~1e-05 etc) with mean of nonzero
            non_zero_mean = df.loc[df[col] > 1e-3, col].mean()
            df.loc[df[col] <= 1e-3, col] = non_zero_mean
    
    return df


def fill_missing_values(df):
    """
    Fill missing values for crops, fertilizers, rainfall, and pesticides
    using state mean → national mean fallback.
    """
    for col in df.columns:
        if col in ["State", "Year", "Crop"]:
            continue

        # Work state by state
        for state, sub in df.groupby("State"):
            state_vals = sub[col].dropna()
            if len(state_vals) > 0:
                state_mean = state_vals.mean()
                mask = (df["State"] == state) & (df[col].isna())
                df.loc[mask, col] = state_mean

        # If still NA, fill with national mean
        if df[col].isna().sum() > 0:
            national_mean = df[col].mean()
            df[col] = df[col].fillna(national_mean)

    return df


def create_master_table():
    # ---------- Load merged dataset ----------
    master = pd.read_csv(FINAL_PATH + "master_dataset.csv")

    # ---------- Drop unwanted columns ----------
    drop_cols = [
        # Per-crop yield wide columns
        "RICE_YIELD_Kg_per_ha","WHEAT_YIELD_Kg_per_ha","KHARIF_SORGHUM_YIELD_Kg_per_ha",
        "RABI_SORGHUM_YIELD_Kg_per_ha","SORGHUM_YIELD_Kg_per_ha","PEARL_MILLET_YIELD_Kg_per_ha",
        "MAIZE_YIELD_Kg_per_ha","FINGER_MILLET_YIELD_Kg_per_ha","BARLEY_YIELD_Kg_per_ha",
        "CHICKPEA_YIELD_Kg_per_ha","PIGEONPEA_YIELD_Kg_per_ha","MINOR_PULSES_YIELD_Kg_per_ha",
        "GROUNDNUT_YIELD_Kg_per_ha","SESAMUM_YIELD_Kg_per_ha","RAPESEED_AND_MUSTARD_YIELD_Kg_per_ha",
        "SAFFLOWER_YIELD_Kg_per_ha","CASTOR_YIELD_Kg_per_ha","LINSEED_YIELD_Kg_per_ha",
        "SUNFLOWER_YIELD_Kg_per_ha","SOYABEAN_YIELD_Kg_per_ha","OILSEEDS_YIELD_Kg_per_ha",
        "SUGARCANE_YIELD_Kg_per_ha","COTTON_YIELD_Kg_per_ha",
        # Fertilizer_N
        "Fertilizer_N"
    ]
    master = master.drop(columns=[col for col in drop_cols if col in master.columns])

    # ---------- Aggregate duplicates ----------
    agg_dict = {col: "mean" for col in master.columns if col not in ["State", "Year", "Crop"]}
    master = master.groupby(["State", "Year", "Crop"], as_index=False).agg(agg_dict)

    # ---------- Fix scientific notation crops ----------
    master = clean_scientific_notation(master)

    # ---------- Handle missing values ----------
    master = fill_missing_values(master)

    # ---------- Save final master ----------
    master.to_csv(OUTPUT_PATH + "master_table.csv", index=False)
    print(f"🎉 Final master table saved at {OUTPUT_PATH}master_table.csv")
    print(f"✅ Shape: {master.shape}")
    print(f"✅ Columns: {list(master.columns)}")


if __name__ == "__main__":
    create_master_table()
