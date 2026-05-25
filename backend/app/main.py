from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db import engine, Base
from app.api import auth, conversations, messages

# 启动时自动建表
import app.models.user  # noqa
import app.models.conversation  # noqa
Base.metadata.create_all(bind=engine)

app = FastAPI(title="ChatGPT Clone API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(conversations.router)
app.include_router(messages.router)


@app.get("/health", tags=["系统"])
def health():
    return {"status": "ok"}
