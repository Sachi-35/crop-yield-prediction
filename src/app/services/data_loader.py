import pandas as pd
from fastapi import HTTPException

DATA_PATH = "data/final/master_table.csv"

def load_data():
    try:
        df = pd.read_csv(DATA_PATH)
        if df.empty:
            raise HTTPException(status_code=500, detail="Master dataset is empty.")
        return df
    except FileNotFoundError:
        raise HTTPException(status_code=500, detail=f"Dataset not found at {DATA_PATH}.")
    except pd.errors.EmptyDataError:
        raise HTTPException(status_code=500, detail="Dataset file is empty.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading dataset: {str(e)}")