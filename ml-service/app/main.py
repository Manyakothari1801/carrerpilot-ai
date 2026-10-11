from fastapi import FastAPI, HTTPException

from .model import ModelUnavailable, Predictor
from .schemas import (CounterfactualRequest, CounterfactualResponse, ExplainResponse,
                      PredictionRequest, PredictionResponse, SimulationRequest,
                      SimulationResponse)

app = FastAPI(title="Career Guidance AI ML Service", version="1.0.0")
try:
    predictor: Predictor | None = Predictor()
    startup_error: str | None = None
except ModelUnavailable as error:
    predictor = None
    startup_error = str(error)


@app.get("/health")
def health():
    if predictor is None:
        raise HTTPException(status_code=503, detail="Model artifact is unavailable")
    return {"status": "UP", "modelVersion": predictor.model_version, "featureSchemaVersion": predictor.feature_schema_version}


@app.get("/version")
def version():
    if predictor is None:
        raise HTTPException(status_code=503, detail="Model artifact is unavailable")
    return {"modelVersion": predictor.model_version, "featureSchemaVersion": predictor.feature_schema_version}


@app.post("/predict", response_model=PredictionResponse)
def predict(request: PredictionRequest):
    if predictor is None:
        raise HTTPException(status_code=503, detail="Model artifact is unavailable")
    return predictor.predict(request)


@app.post("/explain", response_model=ExplainResponse)
def explain(request: PredictionRequest):
    if predictor is None:
        raise HTTPException(status_code=503, detail="Model artifact is unavailable")
    return predictor.explain(request)


@app.post("/simulate", response_model=SimulationResponse)
def simulate(request: SimulationRequest):
    if predictor is None:
        raise HTTPException(status_code=503, detail="Model artifact is unavailable")
    return predictor.simulate(request)


@app.post("/counterfactual", response_model=CounterfactualResponse)
def counterfactual(request: CounterfactualRequest):
    if predictor is None:
        raise HTTPException(status_code=503, detail="Model artifact is unavailable")
    try:
        return predictor.counterfactual(request)
    except ValueError as error:
        raise HTTPException(status_code=422, detail=str(error)) from error

