import os
import pandas as pd
from sklearn.preprocessing import MinMaxScaler

# ---- Inputs (from cleaned step) ----
INPUTS = {
    "crop_yield": "data/cleaned/crop_yield_clean.csv",
    "district_crop": "data/cleaned/district_crop_clean.csv",
    "fertilizers": "data/cleaned/fertilizer_clean.csv",
    "pesticides": "data/cleaned/pesticides_clean.csv",
    "rainfall": "data/cleaned/rainfall_clean.csv",
}

# ---- Outputs (normalized) ----
OUTPUTS = {
    "crop_yield": "data/processed/norm_crop_yield.csv",
    "district_crop": "data/processed/norm_district_crop.csv",
    "fertilizers": "data/processed/norm_fertilizer.csv",
    "pesticides": "data/processed/norm_pesticides.csv",
    "rainfall": "data/processed/norm_rainfall.csv",
}

os.makedirs("data/processed", exist_ok=True)

# ---- Per-file normalization rules ----
RULES = {
    "crop_yield": {
        "id_cols": ["State", "Year", "Crop"],
        "extra_exclude": ["Yield"],  # keep target unscaled
    },
    "district_crop": {
        "id_cols": ["State", "Year"],
        "extra_exclude": [],
    },
    "fertilizers": {
        "id_cols": ["State", "Year"],
        "extra_exclude": [],
    },
    "pesticides": {
        "id_cols": ["State", "Year"],
        "extra_exclude": [],
    },
    "rainfall": {
        "id_cols": ["State", "Year"],
        "extra_exclude": [],
    },
}

# ---- State renaming corrections ----
STATE_RENAMES = {
    "Orissa": "Odisha",
    # Add others here if needed
}

def normalize_one(df: pd.DataFrame, id_cols, extra_exclude):
    # ensure id columns exist
    id_cols = [c for c in id_cols if c in df.columns]
    extra_exclude = [c for c in extra_exclude if c in df.columns]

    # detect numeric candidates
    numeric_cols = df.select_dtypes(include=["number"]).columns.tolist()
    do_not_scale = set(id_cols + extra_exclude + ["Year"])
    cols_to_scale = [c for c in numeric_cols if c not in do_not_scale]

    if not cols_to_scale:
        print("ℹ️ No numeric feature columns to scale in this file.")
        return df

    print(f"→ Scaling columns: {cols_to_scale}")
    scaler = MinMaxScaler()
    scaled = pd.DataFrame(
        scaler.fit_transform(df[cols_to_scale]),
        columns=cols_to_scale,
        index=df.index
    )

    # rebuild dataframe
    keep_unchanged = [c for c in df.columns if c not in cols_to_scale]
    out = pd.concat([df[keep_unchanged], scaled], axis=1)

    # put IDs first
    ordered_cols = id_cols + [c for c in out.columns if c not in id_cols]
    out = out.loc[:, ordered_cols]

    # restore Year as int
    if "Year" in out.columns:
        try:
            out["Year"] = out["Year"].astype(int)
        except Exception:
            pass

    return out

def normalize_dataset(name, in_path, out_path, id_cols, extra_exclude):
    if not os.path.exists(in_path):
        print(f"❌ File not found: {in_path}")
        return
    try:
        df = pd.read_csv(in_path)
    except Exception as e:
        print(f"⚠️ Error reading {in_path}: {e}")
        return

    print(f"\n📂 Normalizing {in_path}")

    # Apply state renaming only for fertilizers
    if name == "fertilizers" and "State" in df.columns:
        df["State"] = df["State"].replace(STATE_RENAMES)
        print("🔄 Standardized state names in fertilizers dataset.")

    df_norm = normalize_one(df, id_cols=id_cols, extra_exclude=extra_exclude)
    df_norm.to_csv(out_path, index=False)
    print(f"✅ Saved → {out_path}")

if __name__ == "__main__":
    for key, in_path in INPUTS.items():
        normalize_dataset(
            key,
            in_path,
            OUTPUTS[key],
            id_cols=RULES[key]["id_cols"],
            extra_exclude=RULES[key]["extra_exclude"],
        )
    print("\n🎉 All datasets normalized (IDs untouched; Year not scaled).")