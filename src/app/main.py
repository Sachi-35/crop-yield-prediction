from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from src.app.routes import states, crops, analysis

app = FastAPI(title="Crop Yield Prediction API", version="1.0")

# Register routes
app.include_router(states.router, prefix="/api")
app.include_router(crops.router, prefix="/api")
app.include_router(analysis.router, prefix="/api")


@app.get("/")
def root():
    return {"message": "Crop Yield Prediction Backend"}


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
