import httpx
import json
import re
from typing import Optional
from app.config import (
    OLLAMA_BASE_URL,
    OLLAMA_MODEL,
    OLLAMA_TIMEOUT,
    OLLAMA_TEMPERATURE,
    OLLAMA_MAX_RETRIES,
)


class AnalysisResult:
    corrected_text: str
    tips: list[str]
    score: int
    errors_found: int

    def __init__(
        self, corrected_text: str, tips: list[str], score: int, errors_found: int
    ):
        self.corrected_text = corrected_text
        self.tips = tips
        self.score = score
        self.errors_found = errors_found

    def to_dict(self) -> dict:
        return {
            "corrected_text": self.corrected_text,
            "tips": self.tips,
            "score": self.score,
            "errors_found": self.errors_found,
        }


class AIService:
    def __init__(self):
        self.base_url = OLLAMA_BASE_URL
        self.model = OLLAMA_MODEL

    async def analyze_text(self, text: str) -> AnalysisResult:
        """Analyze text using Ollama for grammar correction and scoring."""
        if not text or not text.strip():
            return AnalysisResult(
                corrected_text="",
                tips=["Please enter some text to analyze."],
                score=10,
                errors_found=0,
            )

        prompt = self._build_prompt(text)

        for attempt in range(OLLAMA_MAX_RETRIES):
            try:
                response = await self._call_ollama(prompt)
                result = self._parse_response(response)
                return result
            except Exception as e:
                if attempt == OLLAMA_MAX_RETRIES - 1:
                    break

        return self._fallback_analysis(text)

    def _build_prompt(self, text: str) -> str:
        """Build the prompt for Ollama."""
        return f"""You are a professional English writing assistant. Analyze the following text and return ONLY valid JSON (no markdown, no explanations, no code blocks):\n\nText to analyze: "{text}"\n\nReturn this exact JSON format:\n{{\n  "corrected_text": "Your corrected version here with proper grammar and style",\n  "tips": ["Tip 1 about grammar", "Tip 2 about style"],\n  "score": <number 1-10>,\n  "errors_found": <number of errors found>\n}}\n\nUse this strict scoring scale:\n- 10: Flawless, publication-ready, perfect grammar and style\n- 9: Nearly perfect, only the most minor issues\n- 8: Very good, only minor issues that don't affect meaning\n- 7: Good, some noticeable errors but still clear\n- 6: Acceptable, several errors that affect readability\n- 5: Below average, multiple errors requiring revision\n- 4: Poor, many errors, difficult to read in places\n- 3: Very poor, significant errors throughout\n- 2: Barely understandable, major issues\n- 1: Unacceptable, almost incomprehensible\n\nBe strict. Default to lower scores. Only give 9-10 for truly excellent writing."""

    async def _call_ollama(self, prompt: str) -> str:
        """Make request to Ollama API."""
        async with httpx.AsyncClient(timeout=OLLAMA_TIMEOUT) as client:
            response = await client.post(
                f"{self.base_url}/api/generate",
                json={
                    "model": self.model,
                    "prompt": prompt,
                    "stream": False,
                    "options": {"temperature": OLLAMA_TEMPERATURE},
                },
            )
            response.raise_for_status()
            return response.json()["response"]

    def _parse_response(self, response_text: str) -> AnalysisResult:
        """Parse the JSON response from Ollama."""
        # Try to extract JSON from response
        json_match = re.search(r"\{.*\}", response_text, re.DOTALL)
        if not json_match:
            return self._fallback_analysis("")

        try:
            data = json.loads(json_match.group())
            corrected_text = str(data.get("corrected_text", ""))
            tips = data.get("tips", ["Analysis complete."])
            if not isinstance(tips, list):
                tips = [str(tips)]
            score = int(data.get("score", 5))
            errors_found = int(data.get("errors_found", 0))

            return AnalysisResult(
                corrected_text=corrected_text,
                tips=tips,
                score=max(1, min(10, score)),
                errors_found=errors_found,
            )
        except (json.JSONDecodeError, TypeError, ValueError):
            return self._fallback_analysis("")

    def _fallback_analysis(self, original_text: str) -> AnalysisResult:
        """Fallback analysis when AI is unavailable."""
        word_count = len(original_text.split()) if original_text else 0

        tips = []
        if word_count > 0:
            tips.append("Basic text analysis available.")
            tips.append("AI service is currently unavailable for detailed analysis.")
        else:
            tips.append("Please enter some text to analyze.")

        return AnalysisResult(
            corrected_text=original_text,
            tips=tips,
            score=5,
            errors_found=0,
        )
