from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class TodoBase(BaseModel):
    name: str
    detail: Optional[str] = ""


class TodoCreate(TodoBase):
    pass


class TodoUpdate(BaseModel):
    name: Optional[str] = None
    detail: Optional[str] = None


class TodoResponse(TodoBase):
    id: int
    owner: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True
