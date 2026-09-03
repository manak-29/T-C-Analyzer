"""
T&C Analyzer - Unified Vercel Serverless API
=============================================
Combines the backend API + ML inference into a single serverless function.
Models are loaded from the ml-server directory (bundled with the deployment).
"""

import json
import os
import re
import hashlib
import sys
from pathlib import Path
from urllib.parse import urlparse

import httpx
import joblib
import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# ---------------------------------------------------------------------------
# Load ML models (bundled from ml-server/)
# ---------------------------------------------------------------------------
MODELS_DIR = Path(__file__).parent.parent / "ml-server"

cat_clf  = joblib.load(str(MODELS_DIR / "category_classifier.joblib"))
cat_enc  = joblib.load(str(MODELS_DIR / "category_label_encoder.joblib"))
risk_clf = joblib.load(str(MODELS_DIR / "risk_classifier.joblib"))
risk_enc = joblib.load(str(MODELS_DIR / "risk_label_encoder.joblib"))

with open(MODELS_DIR / "risk_weights.json") as f:
    risk_weights = json.load(f)

with open(MODELS_DIR / "model_metadata.json") as f:
    metadata = json.load(f)

# ---------------------------------------------------------------------------
# FastAPI app
# ---------------------------------------------------------------------------
app = FastAPI(title="T&C Analyzer API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# In-memory cache
# ---------------------------------------------------------------------------
_analysis_cache: dict[str, dict] = {}

# ---------------------------------------------------------------------------
# Request / Response schemas
# ---------------------------------------------------------------------------
class AnalyzeRequest(BaseModel):
    url: str

class AnalyzeResponse(BaseModel):
    id: str
    companyName: str
    riskScore: float
    riskLevel: str
    summary: str
    clauses: list[dict]
    cached: bool

# ---------------------------------------------------------------------------
# Text utilities
# ---------------------------------------------------------------------------
_TAG_RE = re.compile(r"<[^>]+>")
_MULTI_SPACE = re.compile(r"\s+")


def clean_html(text: str) -> str:
    text = _TAG_RE.sub(" ", text)
    text = text.lower()
    text = re.sub(r"[^a-z0-9\s.,;:!?()\\"'/-]", " ", text)
    text = _MULTI_SPACE.sub(" ", text).strip()
    return text


def segment_clauses(text: str) -> list[str]:
    patterns = [
        r'\n\s*(?:Section|Clause|Article|Paragraph|§)\s+\d+',
        r'\n\s*\d+\.\s+',
        r'\n\s*\(\w+\)\s+',
    ]
    for pattern in patterns:
        parts = re.split(pattern, text)
        if len(parts) > 2:
            return [p.strip() for p in parts if len(p.strip()) > 50]

    parts = text.split('\n\n')
    if len(parts) > 2:
        return [p.strip() for p in parts if len(p.strip()) > 50]

    sentences = re.split(r'(?<=[.!?])\s+', text)
    clauses = []
    for i in range(0, len(sentences), 3):
        chunk = ' '.join(sentences[i:i+3])
        if len(chunk.strip()) > 50:
            clauses.append(chunk.strip())

    return clauses if clauses else [text[:2000]]


def extract_company_name(url: str, html_text: str) -> str:
    parsed = urlparse(url)
    hostname = parsed.hostname or ''
    company_map = {
        'openai': 'OpenAI', 'google': 'Google', 'apple': 'Apple',
        'microsoft': 'Microsoft', 'amazon': 'Amazon', 'meta': 'Meta',
        'facebook': 'Meta', 'slack': 'Slack', 'stripe': 'Stripe',
        'github': 'GitHub', 'anthropic': 'Anthropic', 'netflix': 'Netflix',
        'spotify': 'Spotify', 'discord': 'Discord', 'reddit': 'Reddit',
        'twitter': 'Twitter', 'x.com': 'X Corp', 'linkedin': 'LinkedIn',
        'adobe': 'Adobe', 'salesforce': 'Salesforce', 'cloudflare': 'Cloudflare',
        'zoom': 'Zoom', 'notion': 'Notion', 'figma': 'Figma',
        'canva': 'Canva', 'dropbox': 'Dropbox', 'shopify': 'Shopify',
        'twitch': 'Twitch', 'tiktok': 'TikTok', 'uber': 'Uber',
        'airbnb': 'Airbnb', 'tesla': 'Tesla', 'nvidia': 'NVIDIA',
    }
    for key, name in company_map.items():
        if key in hostname.lower():
            return name
    domain = hostname.replace('www.', '').split('.')[0]
    return domain.capitalize() if domain else 'Unknown'


def clean_text(text: str) -> str:
    text = _TAG_RE.sub(" ", text)
    text = text.lower()
    text = re.sub(r"[^a-z0-9\s.,;:!?()\\"'/-]", " ", text)
    text = _MULTI_SPACE.sub(" ", text).strip()
    return text


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
        "clause": text, "category": category,
        "category_confidence": round(cat_conf, 4),
        "risk_level": risk_level,
        "risk_confidence": round(risk_conf, 4),
        "risk_score": risk_score,
    }

# ---------------------------------------------------------------------------
# Clause enrichment
# ---------------------------------------------------------------------------
CATEGORY_DESCRIPTIONS = {
    'data_sharing': {
        'title': 'Data Sharing & Privacy',
        'low': 'This clause describes how your data is collected and shared. The terms appear standard and reasonable.',
        'medium': 'This clause permits data collection and sharing with third parties. Review which specific data types are collected.',
        'high': 'This clause grants broad data sharing rights. Your data may be shared without explicit consent.',
    },
    'arbitration': {
        'title': 'Dispute Resolution & Arbitration',
        'low': 'Dispute resolution terms are balanced. You retain access to courts.',
        'medium': 'This clause includes arbitration provisions. You may have limited court access.',
        'high': 'This clause mandates binding arbitration and may include a class action waiver.',
    },
    'termination': {
        'title': 'Termination & Billing',
        'low': 'Termination and billing terms are straightforward.',
        'medium': 'This clause includes auto-renewal or non-refundable payment terms.',
        'high': 'This clause contains aggressive renewal traps, non-refundable fees, or unilateral suspension rights.',
    },
    'liability': {
        'title': 'Liability & Indemnification',
        'low': 'Liability terms are balanced between both parties.',
        'medium': 'This clause limits the company\'s liability or shifts some risk to you.',
        'high': 'This clause severely limits the company\'s liability or imposes broad indemnification on you.',
    },
    'ip_license': {
        'title': 'Intellectual Property & Licensing',
        'low': 'IP terms clearly define ownership. You retain control over your content.',
        'medium': 'This clause grants the company a license to use your content.',
        'high': 'This clause grants broad IP rights. Your content may be used beyond the original service.',
    },
    'payments': {
        'title': 'Payments & Fees',
        'low': 'Payment terms are transparent with clear pricing.',
        'medium': 'This clause includes fee structures that may change or include hidden costs.',
        'high': 'This clause permits unilateral price changes or contains non-refundable fees.',
    },
    'other': {
        'title': 'General Terms',
        'low': 'Standard legal language with balanced obligations.',
        'medium': 'This clause contains provisions that may affect your rights.',
        'high': 'This clause contains terms that significantly affect your rights or obligations.',
    },
}

CATEGORY_TIPS = {
    'data_sharing': 'Check privacy settings and opt out of data sharing where possible.',
    'arbitration': 'Check if an arbitration opt-out letter must be sent within 30 days.',
    'termination': 'Set calendar reminders for renewal dates and save all billing receipts.',
    'liability': 'Request mutual indemnification and negotiate liability caps.',
    'ip_license': 'Ensure the license is limited to providing the service.',
    'payments': 'Lock in pricing where possible and negotiate refund conditions.',
    'other': 'Flag this clause for legal review if the contract value is significant.',
}

WHY_MAP = {
    'data_sharing': 'Your personal data may be collected, stored, or shared with third parties.',
    'arbitration': 'Your legal rights to sue in court or participate in class actions may be restricted.',
    'termination': 'You may be locked into contracts or forfeit prepaid fees.',
    'liability': 'The company limits its financial responsibility, leaving you exposed to losses.',
    'ip_license': 'The company may use your content beyond the scope of the service.',
    'payments': 'Unexpected fees or unilateral price increases could affect your budget.',
    'other': 'This clause contains legal obligations that may affect your rights.',
}


def enrich_clause(ml_result: dict, original_text: str) -> dict:
    category = ml_result.get('category', 'other')
    risk = ml_result.get('risk_level', 'medium')
    cat_info = CATEGORY_DESCRIPTIONS.get(category, CATEGORY_DESCRIPTIONS['other'])
    return {
        'clause': original_text[:500],
        'category': category,
        'category_confidence': ml_result.get('category_confidence', 0),
        'risk_level': risk,
        'risk_confidence': ml_result.get('risk_confidence', 0),
        'risk_score': ml_result.get('risk_score', 5),
        'title': cat_info['title'],
        'plain_english': cat_info.get(risk, cat_info['medium']),
        'why_it_matters': WHY_MAP.get(category, WHY_MAP['other']),
        'actionable_tip': CATEGORY_TIPS.get(category, CATEGORY_TIPS['other']),
    }


def generate_summary(clauses: list[dict], overall_risk: str) -> str:
    risk_counts = {'high': 0, 'medium': 0, 'low': 0}
    categories = set()
    for c in clauses:
        lvl = c.get('risk_level', 'low')
        risk_counts[lvl] = risk_counts.get(lvl, 0) + 1
        categories.add(c.get('category', 'other'))
    parts = []
    if risk_counts['high'] > 0:
        parts.append(f"{risk_counts['high']} high-risk clause(s) detected")
    if risk_counts['medium'] > 0:
        parts.append(f"{risk_counts['medium']} moderate-risk clause(s) identified")
    if risk_counts['low'] > 0:
        parts.append(f"{risk_counts['low']} low-risk clause(s) found")
    category_str = ', '.join(sorted(categories)[:5])
    risk_desc = {
        'high': 'This document contains significant risk factors that require careful review.',
        'medium': 'This document has moderate risk levels. Standard precautions recommended.',
        'low': 'This document appears to have generally favorable terms.',
    }
    return f"Analysis identified {', '.join(parts)} across categories: {category_str}. {risk_desc.get(overall_risk, '')}"

# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------
@app.get("/api/health")
def health():
    return {"status": "ok", "models_loaded": True}


@app.post("/api/analyze", response_model=AnalyzeResponse)
async def analyze(req: AnalyzeRequest):
    url = req.url.strip()
    if not url.startswith("http"):
        raise HTTPException(status_code=400, detail="Valid URL required")

    url_hash = hashlib.md5(url.encode()).hexdigest()
    if url_hash in _analysis_cache:
        cached = _analysis_cache[url_hash]
        return AnalyzeResponse(**cached, cached=True)

    try:
        async with httpx.AsyncClient(timeout=30, follow_redirects=True) as client:
            resp = await client.get(
                url,
                headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
            )
            resp.raise_for_status()
            html = resp.text
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to fetch URL: {str(e)}")

    text = clean_html(html)
    if len(text) < 200:
        raise HTTPException(status_code=400, detail="Could not extract sufficient content from URL")

    clauses_text = segment_clauses(text)
    if not clauses_text:
        raise HTTPException(status_code=400, detail="No clauses found in content")

    clauses = []
    for clause_text in clauses_text[:20]:
        try:
            ml_result = predict_clause(clause_text)
            clauses.append(enrich_clause(ml_result, clause_text))
        except Exception:
            clauses.append(enrich_clause({
                "clause": clause_text[:500], "category": "other",
                "category_confidence": 0.5, "risk_level": "medium",
                "risk_confidence": 0.5, "risk_score": 5.0,
            }, clause_text[:500]))

    if clauses:
        avg_score = sum(c.get("risk_score", 5) for c in clauses) / len(clauses)
        risk_level = "high" if avg_score > 6 else "medium" if avg_score > 3 else "low"
    else:
        avg_score = 5.0
        risk_level = "medium"

    company = extract_company_name(url, text)
    summary = generate_summary(clauses, risk_level)

    result = {
        "id": f"analysis-{url_hash[:12]}",
        "companyName": company,
        "riskScore": round(avg_score, 1),
        "riskLevel": risk_level,
        "summary": summary,
        "clauses": clauses,
        "cached": False,
    }

    _analysis_cache[url_hash] = result
    return AnalyzeResponse(**result)
