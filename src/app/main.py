import warnings
from sklearn.exceptions import InconsistentVersionWarning

warnings.filterwarnings("ignore", category=InconsistentVersionWarning)

from flask import Flask
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from src.app.routes import states, crops, analysis

app = FastAPI(title="Crop Yield Prediction API", version="1.0")

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(states.router, prefix="/api")
app.include_router(crops.router, prefix="/api")
app.include_router(analysis.router, prefix="/api")
# optional alias (so /analysis also works)
app.include_router(states.router, prefix="")
app.include_router(crops.router, prefix="")
app.include_router(analysis.router, prefix="")


@app.get("/")
def root():
    return {"message": "Crop Yield Prediction Backend"}

@app.get("/routes")
def list_routes():
    return [route.path for route in app.routes]


# ✅ Global error handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "Unexpected server error. Please try again later.",
            "detail": str(exc)
        }
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("src.app.main:app", host="127.0.0.1", port=8000, reload=True)
