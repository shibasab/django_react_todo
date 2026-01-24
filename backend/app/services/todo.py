from typing import List, NewType
from sqlalchemy.orm import Session

from app.models.todo import Todo
from app.schemas.todo import TodoCreate, TodoUpdate
from app.repositories.todo import TodoRepository
from app.exceptions import NotFoundError, DuplicateError


# ビジネスバリデーション完了済みのTODOデータを表す型
# 静的型チェッカーがバリデーション済みかどうかを区別できる
ValidatedTodoData = NewType("ValidatedTodoData", TodoCreate)
ValidatedTodoUpdate = NewType("ValidatedTodoUpdate", dict)


class TodoService:
    def __init__(self, db: Session, repo: TodoRepository):
        self.db = db
        self.repo = repo

    def get_todos(self, owner_id: int) -> List[Todo]:
        return self.repo.get_by_owner(owner_id)

    def _ensure_name_unique(
        self, owner_id: int, name: str, exclude_id: int | None = None
    ) -> None:
        """指定した名前が既存のTodoと重複していないことを保証する"""
        if self.repo.check_name_exists(owner_id, name, exclude_id=exclude_id):
            raise DuplicateError(f"Task with name '{name}' already exists", field="name")

    def _validate_todo(
        self, owner_id: int, data: TodoCreate, exclude_id: int | None = None
    ) -> ValidatedTodoData:
        """TODOデータのバリデーションを行い、バリデーション済みデータを返す"""
        self._ensure_name_unique(owner_id, data.name, exclude_id=exclude_id)
        return ValidatedTodoData(data)

    def _validate_update(
        self, owner_id: int, data: TodoUpdate, exclude_id: int
    ) -> ValidatedTodoUpdate:
        update_data = data.model_dump(exclude_unset=True)
        name = update_data.get("name")
        if name is not None:
            self._ensure_name_unique(owner_id, name, exclude_id=exclude_id)
        return ValidatedTodoUpdate(update_data)

    def _create_todo_entity(self, data: ValidatedTodoData, owner_id: int) -> Todo:
        """ValidatedTodoData からTodoエンティティを作成する"""
        return Todo(
            name=data.name,
            detail=data.detail or "",
            due_date=data.due_date,
            owner_id=owner_id,
            is_completed=data.is_completed,
        )

    def _apply_update(self, todo: Todo, data: ValidatedTodoUpdate) -> None:
        """更新対象のフィールドのみをTodoエンティティに反映する"""
        if "name" in data:
            todo.name = data["name"]
        if "detail" in data:
            todo.detail = data["detail"] or ""
        if "due_date" in data:
            todo.due_date = data["due_date"]
        if "is_completed" in data:
            todo.is_completed = data["is_completed"]

    def create_todo(self, data: TodoCreate, owner_id: int) -> Todo:
        validated = self._validate_todo(owner_id, data)

        todo = self._create_todo_entity(validated, owner_id)
        self.repo.create(todo)
        self.db.commit()
        self.db.refresh(todo)
        return todo

    def get_todo(self, todo_id: int, owner_id: int) -> Todo:
        todo = self.repo.get(todo_id, owner_id)
        if not todo:
            raise NotFoundError("Todo not found")
        return todo

    def update_todo(self, todo_id: int, data: TodoUpdate, owner_id: int) -> Todo:
        todo = self.get_todo(todo_id, owner_id)

        update_data = self._validate_update(owner_id, data, exclude_id=todo_id)
        self._apply_update(todo, update_data)
        self.db.commit()
        self.db.refresh(todo)
        return todo

    def delete_todo(self, todo_id: int, owner_id: int) -> None:
        todo = self.get_todo(todo_id, owner_id)
        self.repo.delete(todo)
        self.db.commit()
