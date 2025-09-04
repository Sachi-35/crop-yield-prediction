import pandas as pd
import os

# Paths
CLEAN_PATH = "data/cleaned/"
OUTPUT_PATH = "data/final/"
os.makedirs(OUTPUT_PATH, exist_ok=True)

def fix_false_zeros(df):
    """
    Replace false zeros in crop yield columns:
    If a state has any non-zero values for a crop, then
    replace zeros with state mean (ignoring zeros), else fallback to national mean.
    """
    crop_cols = [c for c in df.columns if "_Yield" in c]

    for col in crop_cols:
        # Work state by state
        for state, sub in df.groupby("State"):
            state_vals = sub[col].replace(0, pd.NA)  # ignore zeros
            if state_vals.notna().sum() > 0:  # at least one valid value
                state_mean = state_vals.mean()

                # Replace only the zeros for that state
                mask = (df["State"] == state) & (df[col] == 0)
                df.loc[mask, col] = state_mean

        # If still zeros left (all years were zero for state),
        # fill with national mean ignoring zeros
        national_mean = df.loc[df[col] != 0, col].mean()
        df[col] = df[col].replace(0, national_mean)

    return df


def merge_datasets():
    # ---------- Load datasets ----------
    crop_yield = pd.read_csv(CLEAN_PATH + "crop_yield_clean.csv")
    district_crop = pd.read_csv(CLEAN_PATH + "district_crop_clean.csv")
    fertilizer = pd.read_csv(CLEAN_PATH + "fertilizer_clean.csv")
    pesticides = pd.read_csv(CLEAN_PATH + "pesticides_clean.csv")
    rainfall = pd.read_csv(CLEAN_PATH + "rainfall_clean.csv")

    # ---------- Preprocess District Crop ----------
    # Remove district column & aggregate by state-year
    if "District" in district_crop.columns:
        district_crop = district_crop.drop(columns=["District"])

    district_grouped = district_crop.groupby(["State", "Year"]).mean(numeric_only=True).reset_index()

    # ---------- Preprocess Fertilizers ----------
    # Keep only Fertilizer_Total
    fertilizer = fertilizer[["State", "Year", "Fertilizer_Total"]]

    # ---------- Preprocess Pesticides ----------
    # National level → spread to all states
    pesticides_country = pesticides.groupby("Year")["Pesticides"].sum().reset_index()
    pesticides_country.rename(columns={"Pesticides": "Pesticides_total_country"}, inplace=True)

    # ---------- Merge ----------
    # Start with crop_yield (has State, Year, Crop)
    master = crop_yield.copy()

    # Merge state-level district yields
    master = master.merge(district_grouped, on=["State", "Year"], how="left")

    # Merge fertilizers
    master = master.merge(fertilizer, on=["State", "Year"], how="left")

    # Merge rainfall
    master = master.merge(rainfall, on=["State", "Year"], how="left")

    # Merge pesticides (national → match by year)
    master = master.merge(pesticides_country, on="Year", how="left")

    # ---------- Handle False Zeros in Crop Yields ----------
    master = fix_false_zeros(master)

    # ---------- Save ----------
    master.to_csv(OUTPUT_PATH + "master_dataset.csv", index=False)
    print(f"🎉 Master dataset saved at {OUTPUT_PATH}master_dataset.csv")
    print(f"✅ Final shape: {master.shape}")
    print(f"✅ Columns: {list(master.columns)}")


if __name__ == "__main__":
    merge_datasets()
