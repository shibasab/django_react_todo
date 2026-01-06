# Django ORMを使用するため（SQLAlchemy移行後に削除する）
import app.django_setup  # noqa: F401

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import auth, todo

app = FastAPI(
    title="Todo API",
    description="FastAPI + Django ORM を使用したTodo API",
    version="1.0.0"
)

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ルーター
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(todo.router, prefix="/api/todo", tags=["todo"])


@app.get("/")
async def root():
    """ヘルスチェック"""
    return {"message": "Todo API is running"}
