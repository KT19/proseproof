import httpx
from fastapi import APIRouter

from app.config import OLLAMA_BASE_URL, OLLAMA_MODEL

router = APIRouter(tags=["health"])


@router.get("/health")
async def check_ollama_health():
    """Check Ollama connectivity and model availability."""
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(f"{OLLAMA_BASE_URL}/api/tags")
            if response.status_code == 200:
                data = response.json()
                models = [m["name"] for m in data.get("models", [])]
                is_model_available = OLLAMA_MODEL in models

                return {
                    "status": "healthy",
                    "connected": True,
                    "model_available": is_model_available,
                    "message": "Ollama is online",
                }
    except Exception:
        pass

    return {
        "status": "unhealthy",
        "connected": False,
        "model_available": False,
        "message": "Ollama is offline",
    }
