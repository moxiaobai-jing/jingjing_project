from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List
from app.db import get_db
from app.models.conversation import Conversation, Message
from app.schemas.conversation import MessageResponse, ChatRequest
from app.core.security import get_current_user_id
from app.services.llm import stream_chat

router = APIRouter(prefix="/conversations", tags=["消息"])


@router.get("/{conv_id}/messages", response_model=List[MessageResponse])
def list_messages(
    conv_id: int,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    conv = db.query(Conversation).filter(
        Conversation.id == conv_id,
        Conversation.user_id == user_id
    ).first()
    if not conv:
        raise HTTPException(status_code=404, detail="会话不存在")
    return db.query(Message).filter(
        Message.conversation_id == conv_id
    ).order_by(Message.created_at.asc()).all()


@router.post("/{conv_id}/chat")
async def chat(
    conv_id: int,
    body: ChatRequest,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    conv = db.query(Conversation).filter(
        Conversation.id == conv_id,
        Conversation.user_id == user_id
    ).first()
    if not conv:
        raise HTTPException(status_code=404, detail="会话不存在")

    # 保存用户消息
    user_msg = Message(conversation_id=conv_id, role="user", content=body.content)
    db.add(user_msg)
    db.commit()

    # 构建发送给 MiniMax 的消息列表
    history = db.query(Message).filter(
        Message.conversation_id == conv_id
    ).order_by(Message.created_at.asc()).all()

    messages = []
    if conv.system_prompt:
        messages.append({"role": "system", "content": conv.system_prompt})
    messages += [{"role": m.role, "content": m.content} for m in history]

    # 流式返回，同时收集完整回复用于存库
    async def generate():
        full_reply = []
        try:
            async for chunk in stream_chat(messages):
                full_reply.append(chunk)
                yield f"data: {chunk}\n\n"
        finally:
            # 流结束后保存 AI 回复
            if full_reply:
                ai_msg = Message(
                    conversation_id=conv_id,
                    role="assistant",
                    content="".join(full_reply)
                )
                db.add(ai_msg)
                db.commit()
        yield "data: [DONE]\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream")
