from typing import List
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.todo import Todo
from app.schemas.todo import TodoCreate, TodoUpdate
from app.repositories.todo import TodoRepository


class TodoService:
    def __init__(self, db: Session, repo: TodoRepository):
        self.db = db
        self.repo = repo

    def get_todos(self, owner_id: int) -> List[Todo]:
        return self.repo.get_by_owner(owner_id)

    def create_todo(self, data: TodoCreate, owner_id: int) -> Todo:
        todo = Todo(name=data.name, detail=data.detail or "", owner_id=owner_id)
        self.repo.create(todo)
        self.db.commit()
        self.db.refresh(todo)
        return todo

    def get_todo(self, todo_id: int, owner_id: int) -> Todo:
        todo = self.repo.get(todo_id, owner_id)
        if not todo:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Todo not found"
            )
        return todo

    def update_todo(self, todo_id: int, data: TodoCreate, owner_id: int) -> Todo:
        todo = self.get_todo(todo_id, owner_id)
        todo.name = data.name
        todo.detail = data.detail or ""
        self.db.commit()
        self.db.refresh(todo)
        return todo

    def partial_update_todo(
        self, todo_id: int, data: TodoUpdate, owner_id: int
    ) -> Todo:
        todo = self.get_todo(todo_id, owner_id)
        if data.name is not None:
            todo.name = data.name
        if data.detail is not None:
            todo.detail = data.detail
        self.db.commit()
        self.db.refresh(todo)
        return todo

    def delete_todo(self, todo_id: int, owner_id: int) -> None:
        todo = self.get_todo(todo_id, owner_id)
        self.repo.delete(todo)
        self.db.commit()
