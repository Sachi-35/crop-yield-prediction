from fastapi import APIRouter, HTTPException
from src.app.services.data_loader import load_data

router = APIRouter(tags=["States"])

@router.get("/states")
def get_states():
    df = load_data()
    states = df["State"].dropna().unique().tolist()
    if not states:
        raise HTTPException(status_code=404, detail="No states found in dataset.")
    return {"states": states}
