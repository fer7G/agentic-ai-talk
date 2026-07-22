import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app import esmfold_client
from app.model_service import get_service
from app.presets import PRESETS
from app.schemas import AnalysisSequenceRequest, StructureSequenceRequest

app = FastAPI(title="ESM-2 Protein Explorer")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def load_model():
    get_service()  # load once at startup so first request isn't slow


@app.get("/api/health")
def health():
    return get_service().health()


@app.get("/api/presets")
def presets():
    return PRESETS


@app.post("/api/embeddings")
def embeddings(req: AnalysisSequenceRequest):
    return get_service().embeddings(req.sequence)


@app.post("/api/contacts")
def contacts(req: AnalysisSequenceRequest):
    return get_service().contacts(req.sequence)


@app.post("/api/mutations")
def mutations(req: AnalysisSequenceRequest):
    return get_service().mutation_scan(req.sequence)


@app.post("/api/structure")
async def structure(req: StructureSequenceRequest):
    try:
        return await esmfold_client.fold_sequence(req.sequence)
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=502, detail=f"ESMFold API error: {e.response.text}")
    except httpx.RequestError as e:
        raise HTTPException(status_code=502, detail=f"Could not reach ESMFold API: {e}")
