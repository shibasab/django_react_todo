from datetime import date, timedelta
from typing import List, Optional
from sqlalchemy import or_
from sqlalchemy.orm import Session
from app.models.todo import Todo


class TodoRepository:
    def __init__(self, db: Session):
        self.db = db

    def _escape_like(self, value: str) -> str:
        return value.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")

    def get_by_owner(
        self,
        owner_id: int,
        keyword: str | None = None,
        status: str | None = None,
        due_date: str | None = None,
    ) -> List[Todo]:
        db_query = self.db.query(Todo).filter(Todo.owner_id == owner_id)

        if keyword:
            escaped_keyword = self._escape_like(keyword)
            like_keyword = f"%{escaped_keyword}%"
            db_query = db_query.filter(
                or_(
                    Todo.name.ilike(like_keyword, escape="\\"),
                    Todo.detail.ilike(like_keyword, escape="\\"),
                )
            )

        if status and status != "all":
            if status == "completed":
                db_query = db_query.filter(Todo.is_completed.is_(True))
            elif status == "incomplete":
                db_query = db_query.filter(Todo.is_completed.is_(False))

        if due_date and due_date != "all":
            today = date.today()
            if due_date == "today":
                db_query = db_query.filter(Todo.due_date == today)
            elif due_date == "this_week":
                end_date = today + timedelta(days=6)
                db_query = db_query.filter(
                    Todo.due_date >= today,
                    Todo.due_date <= end_date,
                )
            elif due_date == "overdue":
                db_query = db_query.filter(Todo.due_date < today)
            elif due_date == "none":
                db_query = db_query.filter(Todo.due_date.is_(None))

        return db_query.order_by(Todo.created_at.desc()).all()

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
