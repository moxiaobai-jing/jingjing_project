import httpx
import json
from typing import AsyncGenerator
from app.core.config import settings


async def stream_chat(messages: list[dict]) -> AsyncGenerator[str, None]:
    """调用 MiniMax API，流式返回 AI 回复内容"""
    url = "https://api.minimax.chat/v1/text/chatcompletion_v2"
    headers = {
        "Authorization": f"Bearer {settings.MINIMAX_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": settings.MINIMAX_MODEL,
        "messages": messages,
        "stream": True,
        "max_tokens": 2048,
    }

    async with httpx.AsyncClient(timeout=60) as client:
        async with client.stream("POST", url, headers=headers, json=payload) as response:
            response.raise_for_status()
            async for line in response.aiter_lines():
                if not line or not line.startswith("data:"):
                    continue
                data = line[5:].strip()
                if data == "[DONE]":
                    break
                try:
                    chunk = json.loads(data)
                    print("DEBUG chunk:", chunk)
                    choices = chunk.get("choices")
                    if not choices:
                        continue
                    delta = choices[0].get("delta", {}).get("content", "")
                    if delta:
                        yield delta
                except (json.JSONDecodeError, KeyError, TypeError):
                    continue
