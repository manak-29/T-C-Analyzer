"""
T&C Analyzer ML Inference Server
=================================
FastAPI server exposing the trained ML models via HTTP.

Start:
  python "D:\\risk final\\ml-server\\server.py"

Endpoints:
  POST /predict        – classify a single clause
  POST /predict/batch  – classify multiple clauses
  GET  /health         – health check
  GET  /metadata       – model metadata
"""

import json
import os
import re
import sys
from pathlib import Path

import joblib
import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# ---------------------------------------------------------------------------
# Load trained models
# ---------------------------------------------------------------------------
TRAINED_DIR = Path(__file__).parent

cat_clf  = joblib.load(str(TRAINED_DIR / "category_classifier.joblib"))
cat_enc  = joblib.load(str(TRAINED_DIR / "category_label_encoder.joblib"))
risk_clf = joblib.load(str(TRAINED_DIR / "risk_classifier.joblib"))
risk_enc = joblib.load(str(TRAINED_DIR / "risk_label_encoder.joblib"))

with open(TRAINED_DIR / "risk_weights.json") as f:
    risk_weights = json.load(f)

with open(TRAINED_DIR / "model_metadata.json") as f:
    metadata = json.load(f)

# ---------------------------------------------------------------------------
# Text cleaning (must match training)
# ---------------------------------------------------------------------------
_TAG_RE = re.compile(r"<[^>]+>")
_MULTI_SPACE = re.compile(r"\s+")


def clean_text(text: str) -> str:
    text = _TAG_RE.sub(" ", text)
    text = text.lower()
    text = re.sub(r"[^a-z0-9\s.,;:!?()\"'/-]", " ", text)
    text = _MULTI_SPACE.sub(" ", text).strip()
    return text


# ---------------------------------------------------------------------------
# FastAPI app
# ---------------------------------------------------------------------------
app = FastAPI(
    title="T&C Analyzer ML Model",
    description="Risk classification model for Terms & Conditions clauses",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Request / Response schemas
# ---------------------------------------------------------------------------
class ClauseRequest(BaseModel):
    text: str


class BatchRequest(BaseModel):
    clauses: list[str]


class ClauseResponse(BaseModel):
    clause: str
    category: str
    category_confidence: float
    risk_level: str
    risk_confidence: float
    risk_score: float


# ---------------------------------------------------------------------------
# Prediction logic
# ---------------------------------------------------------------------------
def predict_clause(text: str) -> dict:
    cleaned = clean_text(text)

    cat_pred  = cat_clf.predict([cleaned])[0]
    cat_proba = cat_clf.predict_proba([cleaned])[0]
    cat_conf  = float(np.max(cat_proba))
    category  = cat_enc.inverse_transform([cat_pred])[0]

    risk_pred  = risk_clf.predict([cleaned])[0]
    risk_proba = risk_clf.predict_proba([cleaned])[0]
    risk_conf  = float(np.max(risk_proba))
    risk_level = risk_enc.inverse_transform([risk_pred])[0]

    risk_map   = {"low": 2, "medium": 5, "high": 8}
    cat_weight = risk_weights.get(category, 0.5)
    risk_score = risk_map[risk_level] * cat_weight + (1 - cat_weight) * risk_map[risk_level]
    risk_score = round(min(10, max(0, risk_score)), 1)

    return {
        "clause": text,
        "category": category,
        "category_confidence": round(cat_conf, 4),
        "risk_level": risk_level,
        "risk_confidence": round(risk_conf, 4),
        "risk_score": risk_score,
    }


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------
@app.get("/health")
def health():
    return {"status": "ok", "models_loaded": True}


@app.get("/metadata")
def get_metadata():
    return metadata


@app.post("/predict", response_model=ClauseResponse)
def predict(req: ClauseRequest):
    if not req.text or len(req.text.strip()) < 5:
        raise HTTPException(status_code=400, detail="Text too short")
    return predict_clause(req.text)


@app.post("/predict/batch")
def predict_batch(req: BatchRequest):
    if not req.clauses:
        raise HTTPException(status_code=400, detail="No clauses provided")
    if len(req.clauses) > 100:
        raise HTTPException(status_code=400, detail="Max 100 clauses per request")
    return [predict_clause(c) for c in req.clauses]


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("ML_PORT", 8001))
    print(f"Starting ML server on port {port} ...")
    uvicorn.run(app, host="0.0.0.0", port=port)
