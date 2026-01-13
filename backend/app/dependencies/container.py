from fastapi import Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.repositories.todo import TodoRepository
from app.services.todo import TodoService


def get_todo_service(db: Session = Depends(get_db)) -> TodoService:
    repo = TodoRepository(db)
    return TodoService(db, repo)
