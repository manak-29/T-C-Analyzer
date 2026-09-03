"""
T&C Analyzer Backend API
=========================
Unified backend that:
1. Scrapes T&C content from URLs
2. Segments text into clauses
3. Sends clauses to ML server for classification
4. Returns structured analysis results

Start:
  python "D:\\risk final\\backend\\api.py"

Port: 8000 (frontend proxies /api/* here)
"""

import json
import os
import re
import hashlib
from pathlib import Path
from urllib.parse import urlparse

import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
ML_SERVER_URL = os.environ.get("ML_SERVER_URL", "http://localhost:8001")
SCRAPER_TIMEOUT = 30

# ---------------------------------------------------------------------------
# FastAPI app
# ---------------------------------------------------------------------------
app = FastAPI(title="T&C Analyzer Backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Cache (simple in-memory for prototype)
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
# Text cleaning & clause segmentation
# ---------------------------------------------------------------------------
_TAG_RE = re.compile(r"<[^>]+>")
_MULTI_SPACE = re.compile(r"\s+")


def clean_html(text: str) -> str:
    text = _TAG_RE.sub(" ", text)
    text = text.lower()
    text = re.sub(r"[^a-z0-9\s.,;:!?()\"'/-]", " ", text)
    text = _MULTI_SPACE.sub(" ", text).strip()
    return text


def segment_clauses(text: str) -> list[str]:
    """Split text into clause-like segments."""
    # Try splitting by common legal section markers
    patterns = [
        r'\n\s*(?:Section|Clause|Article|Paragraph|§)\s+\d+',
        r'\n\s*\d+\.\s+',
        r'\n\s*\(\w+\)\s+',
    ]

    for pattern in patterns:
        parts = re.split(pattern, text)
        if len(parts) > 2:
            return [p.strip() for p in parts if len(p.strip()) > 50]

    # Fallback: split by double newline
    parts = text.split('\n\n')
    if len(parts) > 2:
        return [p.strip() for p in parts if len(p.strip()) > 50]

    # Last resort: split by sentences
    sentences = re.split(r'(?<=[.!?])\s+', text)
    # Group into ~3-sentence chunks
    clauses = []
    for i in range(0, len(sentences), 3):
        chunk = ' '.join(sentences[i:i+3])
        if len(chunk.strip()) > 50:
            clauses.append(chunk.strip())

    return clauses if clauses else [text[:2000]]


def extract_company_name(url: str, html_text: str) -> str:
    """Try to extract company name from URL or content."""
    parsed = urlparse(url)
    hostname = parsed.hostname or ''

    # Common domain -> company mapping
    company_map = {
        'openai': 'OpenAI',
        'google': 'Google',
        'apple': 'Apple',
        'microsoft': 'Microsoft',
        'amazon': 'Amazon',
        'meta': 'Meta',
        'facebook': 'Meta',
        'slack': 'Slack Technologies',
        'stripe': 'Stripe',
        'github': 'GitHub',
        'anthropic': 'Anthropic',
        'netflix': 'Netflix',
        'spotify': 'Spotify',
        'discord': 'Discord',
        'reddit': 'Reddit',
        'twitter': 'Twitter',
        'x.com': 'X Corp',
        'linkedin': 'LinkedIn',
        'adobe': 'Adobe',
        'salesforce': 'Salesforce',
        'cloudflare': 'Cloudflare',
        'zoom': 'Zoom',
        'notion': 'Notion',
        'figma': 'Figma',
        'canva': 'Canva',
        'dropbox': 'Dropbox',
        'shopify': 'Shopify',
        'twitch': 'Twitch',
        'tiktok': 'TikTok',
        'bytedance': 'ByteDance',
        'uber': 'Uber',
        'airbnb': 'Airbnb',
        'tesla': 'Tesla',
        'nvidia': 'NVIDIA',
    }

    for key, name in company_map.items():
        if key in hostname.lower():
            return name

    # Fallback: use domain name
    domain = hostname.replace('www.', '').split('.')[0]
    return domain.capitalize() if domain else 'Unknown'


def generate_summary(clauses: list[dict], overall_risk: str) -> str:
    """Generate a plain English summary from classified clauses."""
    risk_counts = {'high': 0, 'medium': 0, 'low': 0}
    categories = set()

    for c in clauses:
        risk_counts[c.get('risk_level', 'low')] = risk_counts.get(c.get('risk_level', 'low'), 0) + 1
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
# Clause enrichment: plain English explanations per category + risk
# ---------------------------------------------------------------------------
CATEGORY_DESCRIPTIONS = {
    'data_sharing': {
        'title': 'Data Sharing & Privacy',
        'low': 'This clause describes how your data is collected and shared. The terms appear standard and reasonable.',
        'medium': 'This clause permits data collection and sharing with third parties. Review which specific data types are collected and who receives them.',
        'high': 'This clause grants broad data sharing rights. Your personal or business data may be shared with third parties, analytics providers, or used for profiling without explicit consent.',
    },
    'arbitration': {
        'title': 'Dispute Resolution & Arbitration',
        'low': 'Dispute resolution terms are balanced. You retain access to courts and standard legal remedies.',
        'medium': 'This clause includes arbitration provisions. You may have limited access to courts depending on the dispute type.',
        'high': 'This clause mandates binding arbitration and may include a class action waiver. You forfeit the right to sue in court or join collective legal actions.',
    },
    'termination': {
        'title': 'Termination & Billing',
        'low': 'Termination and billing terms are straightforward with reasonable notice periods.',
        'medium': 'This clause includes auto-renewal or non-refundable payment terms. Be aware of cancellation deadlines and refund policies.',
        'high': 'This clause contains aggressive renewal traps, non-refundable fees, or unilateral suspension rights. You could lose access or money with little notice.',
    },
    'liability': {
        'title': 'Liability & Indemnification',
        'low': 'Liability terms are balanced between both parties with reasonable caps.',
        'medium': 'This clause limits the company\'s liability or shifts some risk to you. Review the indemnification scope carefully.',
        'high': 'This clause severely limits the company\'s liability or imposes broad indemnification obligations on you. Your financial exposure is significant.',
    },
    'ip_license': {
        'title': 'Intellectual Property & Licensing',
        'low': 'IP terms clearly define ownership rights. You retain control over your content and creations.',
        'medium': 'This clause grants the company a license to use your content. Review whether this license survives contract termination.',
        'high': 'This clause grants broad IP rights to the company. Your content, data, or creations may be used for purposes beyond the original service.',
    },
    'payments': {
        'title': 'Payments & Fees',
        'low': 'Payment terms are transparent with clear pricing and refund policies.',
        'medium': 'This clause includes fee structures that may change or include hidden costs. Review the full pricing schedule.',
        'high': 'This clause permits unilateral price changes, contains non-refundable fees, or includes penalty charges for early termination.',
    },
    'other': {
        'title': 'General Terms',
        'low': 'This clause contains standard legal language with balanced obligations.',
        'medium': 'This clause contains provisions that may affect your rights. Review the specific terms carefully.',
        'high': 'This clause contains terms that significantly affect your rights or obligations. Seek legal review before accepting.',
    },
}

CATEGORY_TIPS = {
    'data_sharing': 'Check privacy settings and opt out of data sharing where possible. Review what specific data is collected.',
    'arbitration': 'Check if an arbitration opt-out letter must be sent within a deadline (often 30 days). Keep a copy of all opt-out notices.',
    'termination': 'Set calendar reminders for renewal dates. Screenshot cancellation policies. Save all billing receipts.',
    'liability': 'Request mutual indemnification. Negotiate liability caps that match your business risk exposure.',
    'ip_license': 'Ensure the license is limited to providing the service. Confirm rights revert upon contract termination.',
    'payments': 'Lock in pricing where possible. Negotiate fee increase caps and refund conditions.',
    'other': 'Flag this clause for legal review if the contract value exceeds your risk tolerance.',
}


def enrich_clause(ml_result: dict, original_text: str) -> dict:
    """Add plain English explanations to an ML classification result."""
    category = ml_result.get('category', 'other')
    risk = ml_result.get('risk_level', 'medium')

    cat_info = CATEGORY_DESCRIPTIONS.get(category, CATEGORY_DESCRIPTIONS['other'])
    title = cat_info['title']
    plain_english = cat_info.get(risk, cat_info['medium'])

    # Build why-it-matters based on category
    why_map = {
        'data_sharing': 'Your personal data, usage patterns, or business information may be collected, stored, or shared with third parties.',
        'arbitration': 'Your legal rights to sue in court or participate in class actions may be restricted or eliminated.',
        'termination': 'You may be locked into contracts, lose access to services, or forfeit prepaid fees.',
        'liability': 'The company limits its financial responsibility if something goes wrong, leaving you exposed to losses.',
        'ip_license': 'The company may use your content, data, or intellectual property beyond the scope of the service.',
        'payments': 'Unexpected fees, non-refundable charges, or unilateral price increases could affect your budget.',
        'other': 'This clause contains legal obligations that may affect your rights or responsibilities.',
    }

    actionable_tip = CATEGORY_TIPS.get(category, CATEGORY_TIPS['other'])

    return {
        'clause': original_text[:500],
        'category': category,
        'category_confidence': ml_result.get('category_confidence', 0),
        'risk_level': risk,
        'risk_confidence': ml_result.get('risk_confidence', 0),
        'risk_score': ml_result.get('risk_score', 5),
        'title': title,
        'plain_english': plain_english,
        'why_it_matters': why_map.get(category, why_map['other']),
        'actionable_tip': actionable_tip,
    }


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------
@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/api/analyze", response_model=AnalyzeResponse)
async def analyze(req: AnalyzeRequest):
    url = req.url.strip()

    if not url.startswith("http"):
        raise HTTPException(status_code=400, detail="Valid URL required")

    # Check cache
    url_hash = hashlib.md5(url.encode()).hexdigest()
    if url_hash in _analysis_cache:
        cached = _analysis_cache[url_hash]
        return AnalyzeResponse(**cached, cached=True)

    # Fetch page content
    try:
        async with httpx.AsyncClient(timeout=SCRAPER_TIMEOUT, follow_redirects=True) as client:
            resp = await client.get(
                url,
                headers={
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
                }
            )
            resp.raise_for_status()
            html = resp.text
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to fetch URL: {str(e)}")

    # Basic HTML to text
    text = clean_html(html)

    if len(text) < 200:
        raise HTTPException(status_code=400, detail="Could not extract sufficient content from URL")

    # Segment into clauses
    clauses_text = segment_clauses(text)

    if not clauses_text:
        raise HTTPException(status_code=400, detail="No clauses found in content")

    # Send to ML server for classification
    clauses = []
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            ml_resp = await client.post(
                f"{ML_SERVER_URL}/predict/batch",
                json={"clauses": clauses_text[:20]}  # Limit to 20 clauses
            )
            if ml_resp.status_code == 200:
                ml_results = ml_resp.json()
                clauses = [enrich_clause(r, clauses_text[i] if i < len(clauses_text) else r.get('clause', ''))
                           for i, r in enumerate(ml_results)]
            else:
                for i, c in enumerate(clauses_text[:10]):
                    clauses.append(enrich_clause({
                        "clause": c[:500], "category": "other", "category_confidence": 0.5,
                        "risk_level": "medium", "risk_confidence": 0.5, "risk_score": 5.0,
                    }, c[:500]))
    except Exception:
        for i, c in enumerate(clauses_text[:10]):
            clauses.append(enrich_clause({
                "clause": c[:500], "category": "other", "category_confidence": 0.5,
                "risk_level": "medium", "risk_confidence": 0.5, "risk_score": 5.0,
            }, c[:500]))

    # Compute overall risk
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

    # Cache result
    _analysis_cache[url_hash] = result

    return AnalyzeResponse(**result)


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("BACKEND_PORT", 8000))
    print(f"Starting backend API on port {port} ...")
    uvicorn.run(app, host="0.0.0.0", port=port)
