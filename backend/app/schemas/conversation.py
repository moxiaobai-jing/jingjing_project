from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class ConversationCreate(BaseModel):
    title: str = "新对话"
    system_prompt: str = ""
    model: str = "abab6.5s-chat"


class ConversationUpdate(BaseModel):
    title: Optional[str] = None
    system_prompt: Optional[str] = None
    model: Optional[str] = None


class ConversationResponse(BaseModel):
    id: int
    title: str
    system_prompt: str
    model: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class MessageResponse(BaseModel):
    id: int
    conversation_id: int
    role: str
    content: str
    token_count: int
    created_at: datetime

    class Config:
        from_attributes = True


class ChatRequest(BaseModel):
    content: str
