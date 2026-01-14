from pydantic import BaseModel, Field, ConfigDict
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
    owner: Optional[int] = Field(default=None, validation_alias="owner_id")
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
