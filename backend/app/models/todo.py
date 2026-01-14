from datetime import datetime
from typing import TYPE_CHECKING, Optional

from sqlalchemy import String, Text, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

if TYPE_CHECKING:
    from app.models.user import User

from app.database import Base


class Todo(Base):
    __tablename__ = "todos"
    __table_args__ = (UniqueConstraint("owner_id", "name", name="uq_todo_owner_name"),)

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    detail: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)

    owner: Mapped["User"] = relationship("User", backref="todos")
