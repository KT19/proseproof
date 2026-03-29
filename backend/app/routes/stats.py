from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models.document import Document

router = APIRouter(prefix="/stats", tags=["statistics"])


@router.get("")
async def get_user_stats(db: Session = Depends(get_db)):
    """Get user statistics including total words, average score, and document count."""
    # Total documents
    total_documents = db.query(Document).count()

    # Total words processed
    total_words = db.query(func.sum(Document.word_count)).scalar() or 0

    # Total characters processed
    total_characters = db.query(func.sum(Document.character_count)).scalar() or 0

    # Average score (only for documents with a score)
    avg_score_query = (
        db.query(func.avg(Document.score)).filter(Document.score > 0).scalar()
    )
    avg_score = round(avg_score_query, 1) if avg_score_query else 0

    # Documents with analysis (have a score)
    analyzed_documents = db.query(Document).filter(Document.score > 0).count()

    return {
        "total_documents": total_documents,
        "analyzed_documents": analyzed_documents,
        "total_words": total_words,
        "total_characters": total_characters,
        "average_score": avg_score,
    }
