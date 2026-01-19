from typing import List
from sqlalchemy.orm import Session

from app.models.todo import Todo
from app.schemas.todo import TodoCreate, TodoUpdate
from app.repositories.todo import TodoRepository
from app.exceptions import NotFoundError, DuplicateError


class TodoService:
    def __init__(self, db: Session, repo: TodoRepository):
        self.db = db
        self.repo = repo

    def get_todos(self, owner_id: int) -> List[Todo]:
        return self.repo.get_by_owner(owner_id)

    def create_todo(self, data: TodoCreate, owner_id: int) -> Todo:
        # 重複チェック
        if self.repo.check_name_exists(owner_id, data.name):
            raise DuplicateError(
                f"Task with name '{data.name}' already exists", field="name"
            )

        todo = Todo(
            name=data.name,
            detail=data.detail or "",
            due_date=data.due_date,
            owner_id=owner_id,
        )
        self.repo.create(todo)
        self.db.commit()
        self.db.refresh(todo)
        return todo

    def get_todo(self, todo_id: int, owner_id: int) -> Todo:
        todo = self.repo.get(todo_id, owner_id)
        if not todo:
            raise NotFoundError("Todo not found")
        return todo

    def update_todo(self, todo_id: int, data: TodoCreate, owner_id: int) -> Todo:
        todo = self.get_todo(todo_id, owner_id)

        # 重複チェック（自分自身は除外）
        if self.repo.check_name_exists(owner_id, data.name, exclude_id=todo_id):
            raise DuplicateError(
                f"Task with name '{data.name}' already exists", field="name"
            )

        todo.name = data.name
        todo.detail = data.detail or ""
        todo.due_date = data.due_date
        self.db.commit()
        self.db.refresh(todo)
        return todo

    def partial_update_todo(
        self, todo_id: int, data: TodoUpdate, owner_id: int
    ) -> Todo:
        todo = self.get_todo(todo_id, owner_id)

        # 変更されたフィールドのみ取得
        update_data = data.model_dump(exclude_unset=True)

        if "name" in update_data:
            new_name = update_data["name"]
            if self.repo.check_name_exists(owner_id, new_name, exclude_id=todo_id):
                raise DuplicateError(
                    f"Task with name '{new_name}' already exists", field="name"
                )
            todo.name = new_name

        if "detail" in update_data:
            todo.detail = update_data["detail"]

        if "due_date" in update_data:
            todo.due_date = update_data["due_date"]

        self.db.commit()
        self.db.refresh(todo)
        return todo

    def delete_todo(self, todo_id: int, owner_id: int) -> None:
        todo = self.get_todo(todo_id, owner_id)
        self.repo.delete(todo)
        self.db.commit()
