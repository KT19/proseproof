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
                message = (
                    "Ollama is online"
                    if is_model_available
                    else f'Ollama is online, but model "{OLLAMA_MODEL}" is not installed'
                )

                return {
                    "status": "healthy" if is_model_available else "degraded",
                    "connected": True,
                    "model_available": is_model_available,
                    "message": message,
                }
    except Exception:
        pass

    return {
        "status": "unhealthy",
        "connected": False,
        "model_available": False,
        "message": "Ollama is offline",
    }
