from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.todo import Todo


class TodoRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_owner(self, owner_id: int) -> List[Todo]:
        return (
            self.db.query(Todo)
            .filter(Todo.owner_id == owner_id)
            .order_by(Todo.created_at.desc())
            .all()
        )

    def get(self, todo_id: int, owner_id: int) -> Optional[Todo]:
        return (
            self.db.query(Todo)
            .filter(Todo.id == todo_id, Todo.owner_id == owner_id)
            .first()
        )

    def create(self, todo: Todo) -> Todo:
        self.db.add(todo)
        return todo

    def delete(self, todo: Todo) -> None:
        self.db.delete(todo)
