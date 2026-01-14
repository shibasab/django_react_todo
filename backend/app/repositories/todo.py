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

    def check_name_exists(
        self, owner_id: int, name: str, exclude_id: Optional[int] = None
    ) -> bool:
        """指定されたユーザーIDと名前の組み合わせでタスクが存在するかをチェック

        Args:
            owner_id: タスクの所有者ID
            name: チェックするタスク名
            exclude_id: チェックから除外するタスクID（更新時に自分自身を除外する等）

        Returns:
            bool: タスクが存在する場合True、存在しない場合False
        """
        query = self.db.query(Todo).filter(Todo.owner_id == owner_id, Todo.name == name)
        if exclude_id is not None:
            query = query.filter(Todo.id != exclude_id)
        return query.first() is not None
