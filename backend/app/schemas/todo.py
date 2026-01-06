from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class TodoBase(BaseModel):
    todo_task: str
    detail: Optional[str] = ""


class TodoCreate(TodoBase):
    pass


class TodoUpdate(BaseModel):
    todo_task: Optional[str] = None
    detail: Optional[str] = None


class TodoResponse(TodoBase):
    id: int
    owner: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True
