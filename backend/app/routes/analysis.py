from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import List

from app.services.ai_service import AIService, AnalysisResult

router = APIRouter(prefix="", tags=["analysis"])

ai_service = AIService()


class TextAnalyzeRequest(BaseModel):
    text: str


class TextAnalyzeResponse(BaseModel):
    corrected_text: str
    tips: List[str]
    score: int
    errors_found: int


@router.post("/analyze", response_model=TextAnalyzeResponse)
async def analyze_text(request: TextAnalyzeRequest) -> TextAnalyzeResponse:
    """Analyze text for grammar, style, and provide suggestions."""
    if not request.text or not request.text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Text cannot be empty",
        )

    result = await ai_service.analyze_text(request.text)
    return TextAnalyzeResponse(
        corrected_text=result.corrected_text,
        tips=result.tips,
        score=result.score,
        errors_found=result.errors_found,
    )
