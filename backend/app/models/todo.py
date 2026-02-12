from datetime import datetime, date
from typing import TYPE_CHECKING, Optional, Literal

from sqlalchemy import (
    Boolean,
    Date,
    DateTime,
    ForeignKey,
    Index,
    String,
    Text,
    text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

if TYPE_CHECKING:
    from app.models.user import User

from app.database import Base


class Todo(Base):
    __tablename__ = "todos"
    __table_args__ = (
        Index(
            "ix_todo_owner_name_incomplete_unique",
            "owner_id",
            "name",
            unique=True,
            sqlite_where=text("is_completed = 0"),
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    detail: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    due_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    is_completed: Mapped[bool] = mapped_column(
        Boolean, default=False, server_default=text("0"), nullable=False
    )
    recurrence_type: Mapped[Literal["none", "daily", "weekly", "monthly"]] = (
        mapped_column(
            String(20),
            default="none",
            server_default="none",
            nullable=False,
        )
    )
    previous_todo_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("todos.id", ondelete="SET NULL"),
        nullable=True,
        unique=True,
    )

    owner: Mapped["User"] = relationship("User", backref="todos")
    previous_todo: Mapped[Optional["Todo"]] = relationship(
        "Todo",
        remote_side=[id],
        foreign_keys=[previous_todo_id],
        uselist=False,
    )
