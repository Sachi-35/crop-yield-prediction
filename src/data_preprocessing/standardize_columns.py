import pandas as pd
import os

# Input & output folders
RAW_PATH = "data/raw/"
PROC_PATH = "data/processed/"
os.makedirs(PROC_PATH, exist_ok=True)

# ---------- Helper function ----------
def clean_state_name(state):
    if pd.isna(state):
        return None
    return state.strip().title()  # "ANDHRA PRADESH " → "Andhra Pradesh"

# Placeholder: mapping old IMD subdivision names → current state names
STATE_NAME_MAP = {
    # Example mappings (fill in as needed)
    "Bihar & Jharkhand": "Bihar",
    "Orissa": "Odisha",
    "Uttaranchal": "Uttarakhand",
    # Add more mappings here...
}

# ---------- 1. Crop Yield (1997–2020) ----------
def process_crop_yield():
    df = pd.read_csv(RAW_PATH + "crop_yield_1997_2020.csv")
    
    df = df.rename(columns={
        "Crop_Year": "Year",
        "State": "State",
        "Crop": "Crop",
        "Yield": "Yield",
        "Annual_Rainfall": "Rainfall",
        "Fertilizer": "Fertilizer_N",  # assume it's N usage proxy
        "Pesticide": "Pesticides"
    })

    df = df[["State", "Year", "Crop", "Yield", "Rainfall", "Fertilizer_N", "Pesticides"]]
    df["State"] = df["State"].apply(clean_state_name)

    df.to_csv(PROC_PATH + "std_crop_yield.csv", index=False)
    print("✅ Crop yield standardized")

# ---------- 2. District Crop Data ----------
def process_district_crop():
    df = pd.read_csv(RAW_PATH + "district_crop_data.csv")

    # Standardize all crop yield columns
    rename_dict = {"State Name": "State", "Year": "Year"}
    for col in df.columns:
        if "YIELD" in col.upper():
            rename_dict[col] = col.replace(" ", "_").replace("(", "").replace(")", "").replace("/", "_")
    
    df = df.rename(columns=rename_dict)
    keep_cols = ["State", "Year"] + [c for c in df.columns if "YIELD" in c.upper()]
    df = df[keep_cols]

    df["State"] = df["State"].apply(clean_state_name)
    df.to_csv(PROC_PATH + "std_district_crop.csv", index=False)
    print("✅ District crop standardized (all crops kept)")

# ---------- 3. FAOSTAT Pesticides ----------
def process_pesticides():
    df = pd.read_csv(RAW_PATH + "faostat_pesticide_india.csv")

    # Only keep Agricultural Use
    df = df[df["Element"] == "Agricultural Use"]

    df = df.rename(columns={"Year": "Year", "Value": "Pesticides"})
    df["State"] = "India"

    df = df[["State", "Year", "Pesticides"]]
    df.to_csv(PROC_PATH + "std_pesticides.csv", index=False)
    print("✅ Pesticides standardized (Agricultural Use only)")

# ---------- 4. Fertilizer District ----------
def process_fertilizers():
    df = pd.read_csv(RAW_PATH + "fertilizer_district_1969_2017.csv")

    df = df.rename(columns={
        "State Name": "State",
        "Year": "Year",
        "NITROGEN PER HA OF NCA (Kg per ha)": "Fertilizer_N",
        "PHOSPHATE PER HA OF NCA (Kg per ha)": "Fertilizer_P",
        "POTASH PER HA OF NCA (Kg per ha)": "Fertilizer_K",
        "TOTAL CONSUMPTION (tons)": "Fertilizer_Total"
    })

    df = df[["State", "Year", "Fertilizer_N", "Fertilizer_P", "Fertilizer_K", "Fertilizer_Total"]]
    df["State"] = df["State"].apply(clean_state_name)

    df.to_csv(PROC_PATH + "std_fertilizers.csv", index=False)
    print("✅ Fertilizers standardized (with total consumption)")

# ---------- 5. Rainfall Data ----------
def process_rainfall():
    df = pd.read_csv(RAW_PATH + "imd_rainfall_1901_2017.csv")

    df = df.rename(columns={"SUBDIVISION": "Subdivision", "YEAR": "Year", "ANNUAL": "Rainfall"})
    df = df[["Subdivision", "Year", "Rainfall"]]

    # Subdivision mapping → list of states (splitting & renaming)
    SUBDIVISION_MAP = {
        # Splits
        "Assam & Meghalaya": ["Assam", "Meghalaya"],
        "Naga Mani Mizo Tripura": ["Nagaland", "Manipur", "Mizoram", "Tripura"],
        "Haryana Delhi & Chandigarh": ["Haryana", "Delhi", "Chandigarh"],

        # Renames
        "Orissa": ["Odisha"],
        "Uttaranchal": ["Uttarakhand"],
        "East Uttar Pradesh": ["Uttar Pradesh"],
        "West Uttar Pradesh": ["Uttar Pradesh"],
        "Sub Himalayan West Bengal": ["West Bengal"],
        "Gangetic West Bengal": ["West Bengal"],
        "West Rajasthan": ["Rajasthan"],
        "East Rajasthan": ["Rajasthan"],
        "West Madhya Pradesh": ["Madhya Pradesh"],
        "East Madhya Pradesh": ["Madhya Pradesh"],
        "Gujarat Region": ["Gujarat"],
        "Saurashtra & Kutch": ["Gujarat"],
        "Konkan & Goa": ["Goa"],
        "Madhya Maharashtra": ["Maharashtra"],
        "Marathwada": ["Maharashtra"],
        "Vidarbha": ["Maharashtra"],
        "Coastal Andhra Pradesh": ["Andhra Pradesh"],
        "Rayalseema": ["Andhra Pradesh"],
        "Coastal Karnataka": ["Karnataka"],
        "North Interior Karnataka": ["Karnataka"],
        "South Interior Karnataka": ["Karnataka"],
    }

    expanded_rows = []
    for _, row in df.iterrows():
        subdivision = row["Subdivision"]
        states = SUBDIVISION_MAP.get(subdivision, [subdivision])  # fallback keep original name

        for state in states:
            expanded_rows.append({
                "State": state,
                "Year": row["Year"],
                "Rainfall": row["Rainfall"]
            })

    new_df = pd.DataFrame(expanded_rows)

    # Clean state names
    new_df["State"] = new_df["State"].apply(clean_state_name)

    # Merge duplicated states (like Maharashtra, Gujarat, Andhra Pradesh, Karnataka, etc.)
    merged_df = (
        new_df.groupby(["State", "Year"], as_index=False)
        .agg({"Rainfall": "mean"})  # take average if multiple subdivisions mapped to same state
    )

    merged_df.to_csv(PROC_PATH + "std_rainfall.csv", index=False)
    print("✅ Rainfall standardized with state renaming/splitting/merging")


# ---------- Run all ----------
if __name__ == "__main__":
    process_crop_yield()
    process_district_crop()
    process_pesticides()
    process_fertilizers()
    process_rainfall()
    print("🎉 All datasets standardized and saved in data/processed/")