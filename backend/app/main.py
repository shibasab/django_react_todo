from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine, Base
from app.routers import auth, todo

# データベーステーブルを作成
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Todo API",
    description="FastAPI + SQLAlchemy を使用したTodo API",
    version="2.0.0"
)

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(todo.router, prefix="/api/todo", tags=["todo"])


@app.get("/")
async def root():
    """ヘルスチェック"""
    return {"message": "Todo API is running"}
