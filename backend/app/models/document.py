from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.orm import declarative_base
from datetime import datetime

Base = declarative_base()


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(255), nullable=False, default="Untitled Document")
    original_text = Column(Text, nullable=False, default="")
    corrected_text = Column(Text, nullable=True)
    tips = Column(Text, nullable=True)
    score = Column(Integer, nullable=False, default=5)
    word_count = Column(Integer, nullable=False, default=0)
    character_count = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(
        DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "title": self.title,
            "original_text": self.original_text,
            "corrected_text": self.corrected_text,
            "tips": self.tips,
            "score": self.score,
            "word_count": self.word_count,
            "character_count": self.character_count,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
