from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db import get_db
from app.models.conversation import Conversation
from app.schemas.conversation import ConversationCreate, ConversationUpdate, ConversationResponse
from app.core.security import get_current_user_id

router = APIRouter(prefix="/conversations", tags=["会话"])


def get_conversation_or_404(conv_id: int, user_id: int, db: Session) -> Conversation:
    conv = db.query(Conversation).filter(
        Conversation.id == conv_id,
        Conversation.user_id == user_id
    ).first()
    if not conv:
        raise HTTPException(status_code=404, detail="会话不存在")
    return conv


@router.get("", response_model=List[ConversationResponse])
def list_conversations(user_id: int = Depends(get_current_user_id), db: Session = Depends(get_db)):
    return db.query(Conversation).filter(
        Conversation.user_id == user_id
    ).order_by(Conversation.updated_at.desc()).all()


@router.post("", response_model=ConversationResponse)
def create_conversation(
    body: ConversationCreate,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    conv = Conversation(user_id=user_id, **body.model_dump())
    db.add(conv)
    db.commit()
    db.refresh(conv)
    return conv


@router.patch("/{conv_id}", response_model=ConversationResponse)
def update_conversation(
    conv_id: int,
    body: ConversationUpdate,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    conv = get_conversation_or_404(conv_id, user_id, db)
    for field, value in body.model_dump(exclude_none=True).items():
        setattr(conv, field, value)
    db.commit()
    db.refresh(conv)
    return conv


@router.delete("/{conv_id}", status_code=204)
def delete_conversation(
    conv_id: int,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    conv = get_conversation_or_404(conv_id, user_id, db)
    db.delete(conv)
    db.commit()
