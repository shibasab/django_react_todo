from typing import List, NewType
from sqlalchemy.orm import Session

from app.models.todo import Todo
from app.schemas.todo import TodoCreate, TodoUpdate
from app.repositories.todo import TodoRepository
from app.exceptions import NotFoundError, DuplicateError


# ビジネスバリデーション完了済みのTODOデータを表す型
# 静的型チェッカーがバリデーション済みかどうかを区別できる
ValidatedTodoData = NewType("ValidatedTodoData", TodoCreate)
ValidatedTodoUpdateData = NewType("ValidatedTodoUpdateData", dict)


class TodoService:
    def __init__(self, db: Session, repo: TodoRepository):
        self.db = db
        self.repo = repo

    def get_todos(self, owner_id: int) -> List[Todo]:
        return self.repo.get_by_owner(owner_id)

    def _validate_todo(
        self, owner_id: int, data: TodoCreate, exclude_id: int | None = None
    ) -> ValidatedTodoData:
        """TODOデータのバリデーションを行い、バリデーション済みデータを返す

        現在は名前の重複チェックのみを実施。
        今後、他のバリデーションルールもこのメソッドに追加していく。

        Args:
            owner_id: オーナーID
            data: バリデーション対象のTODOデータ
            exclude_id: チェックから除外するTodoのID
                （更新時に自分自身を除外するために使用）

        Returns:
            ValidatedTodoData: バリデーション済みのTODOデータ

        Raises:
            DuplicateError: 名前が重複している場合
        """
        # 名前の重複チェック
        if self.repo.check_name_exists(owner_id, data.name, exclude_id=exclude_id):
            raise DuplicateError(
                f"Task with name '{data.name}' already exists", field="name"
            )
        return ValidatedTodoData(data)

    def _create_todo_entity(self, data: ValidatedTodoData, owner_id: int) -> Todo:
        """ValidatedTodoData からTodoエンティティを作成する"""
        return Todo(
            name=data.name,
            detail=data.detail or "",
            due_date=data.due_date,
            owner_id=owner_id,
            is_completed=data.is_completed,
        )

    def _apply_update(self, todo: Todo, data: ValidatedTodoData) -> None:
        """ValidatedTodoData を使ってTodoエンティティを更新する（全置換）"""
        todo.name = data.name
        todo.detail = data.detail or ""
        todo.due_date = data.due_date
        todo.is_completed = data.is_completed

    def _validate_update(
        self, owner_id: int, todo: Todo, data: TodoUpdate
    ) -> ValidatedTodoUpdateData:
        """更新データのバリデーションを行い、バリデーション済みデータを返す

        Args:
            owner_id: オーナーID
            todo: 更新対象のTodoエンティティ
            data: バリデーション対象の更新データ

        Returns:
            ValidatedTodoUpdateData: バリデーション済みの更新データ
                （設定されたフィールドのみ）

        Raises:
            DuplicateError: 名前が重複している場合
        """
        # exclude_unset=Trueで実際にリクエストに含まれるフィールドのみ取得
        # by_alias=Trueでエイリアス名（dueDate, isCompleted）をPython名に変換
        update_data = data.model_dump(exclude_unset=True, by_alias=False)

        # 名前が更新される場合は重複チェック
        if "name" in update_data:
            if self.repo.check_name_exists(
                owner_id, update_data["name"], exclude_id=todo.id
            ):
                raise DuplicateError(
                    f"Task with name '{update_data['name']}' already exists",
                    field="name",
                )

        return ValidatedTodoUpdateData(update_data)

    def _apply_partial_update(
        self, todo: Todo, update_data: ValidatedTodoUpdateData
    ) -> None:
        """リクエストに含まれるフィールドのみTodoエンティティを更新する"""
        for field, value in update_data.items():
            if field == "detail":
                value = value or ""
            setattr(todo, field, value)

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
        """Todoを更新する（部分更新対応）

        リクエストに含まれるフィールドのみ更新される。
        """
        todo = self.get_todo(todo_id, owner_id)

        validated = self._validate_update(owner_id, todo, data)

        self._apply_partial_update(todo, validated)
        self.db.commit()
        self.db.refresh(todo)
        return todo

    def delete_todo(self, todo_id: int, owner_id: int) -> None:
        todo = self.get_todo(todo_id, owner_id)
        self.repo.delete(todo)
        self.db.commit()
