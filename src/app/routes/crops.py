from fastapi import APIRouter, HTTPException
from src.app.services.data_loader import load_data

router = APIRouter(tags=["Crops"])

@router.get("/crops")
def get_crops(state: str = None):
    df = load_data()

    if state:
        crops = df[df["State"].str.lower() == state.lower()]["Crop"].dropna().unique().tolist()
        if not crops:
            raise HTTPException(status_code=404, detail=f"No crops found for state '{state}'.")
    else:
        crops = df["Crop"].dropna().unique().tolist()
        if not crops:
            raise HTTPException(status_code=404, detail="No crops found in dataset.")

    return {"crops": crops}
