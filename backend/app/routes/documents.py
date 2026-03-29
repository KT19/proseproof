from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

from app.database import get_db
from app.models.document import Document

router = APIRouter(prefix="/documents", tags=["documents"])


class DocumentCreate(BaseModel):
    title: Optional[str] = "Untitled Document"
    original_text: str = ""


class DocumentUpdate(BaseModel):
    title: Optional[str] = None
    original_text: Optional[str] = None
    corrected_text: Optional[str] = None
    tips: Optional[str] = None
    score: Optional[int] = None


@router.post("", response_model=dict, status_code=status.HTTP_201_CREATED)
def create_document(doc: DocumentCreate, db: Session = Depends(get_db)) -> dict:
    """Create a new document."""
    word_count = len(doc.original_text.split()) if doc.original_text else 0
    character_count = len(doc.original_text) if doc.original_text else 0

    db_document = Document(
        title=doc.title,
        original_text=doc.original_text,
        word_count=word_count,
        character_count=character_count,
    )
    db.add(db_document)
    db.commit()
    db.refresh(db_document)

    return db_document.to_dict()


@router.get("", response_model=List[dict])
def list_documents(
    skip: int = 0, limit: int = 100, db: Session = Depends(get_db)
) -> List[dict]:
    """List all documents."""
    documents = (
        db.query(Document)
        .order_by(Document.updated_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return [doc.to_dict() for doc in documents]


@router.get("/{doc_id}", response_model=dict)
def get_document(doc_id: int, db: Session = Depends(get_db)) -> dict:
    """Get a single document by ID."""
    document = db.query(Document).filter(Document.id == doc_id).first()
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found",
        )
    return document.to_dict()


@router.put("/{doc_id}", response_model=dict)
def update_document(
    doc_id: int, doc: DocumentUpdate, db: Session = Depends(get_db)
) -> dict:
    """Update a document."""
    document = db.query(Document).filter(Document.id == doc_id).first()
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found",
        )

    update_data = doc.model_dump(exclude_unset=True)

    # Update word and character counts if original_text changed
    if "original_text" in update_data:
        update_data["word_count"] = len(update_data["original_text"].split())
        update_data["character_count"] = len(update_data["original_text"])

    for key, value in update_data.items():
        setattr(document, key, value)

    document.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(document)

    return document.to_dict()


@router.delete("/{doc_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_document(doc_id: int, db: Session = Depends(get_db)):
    """Delete a document."""
    document = db.query(Document).filter(Document.id == doc_id).first()
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found",
        )

    db.delete(document)
    db.commit()
    return None
