from pydantic import BaseModel, Field, ConfigDict, AfterValidator
from pydantic_core import PydanticCustomError
from typing import Optional, Annotated
from datetime import datetime, date


# TODO: バリデーション処理を別ファイルに移動する
def validate_not_empty(v: str) -> str:
    """空文字列または空白のみの文字列を拒否するバリデーター"""
    if not v or not v.strip():
        raise PydanticCustomError(
            "required",
            "Field is required",
        )
    return v


# 必須文字列型（空文字列を許可しない）
RequiredStr = Annotated[str, AfterValidator(validate_not_empty)]


class TodoBase(BaseModel):
    name: RequiredStr = Field(..., max_length=100)
    detail: str = Field(default="", max_length=500)
    due_date: Optional[date] = Field(default=None, alias="dueDate")


class TodoCreate(TodoBase):
    pass


class TodoUpdate(BaseModel):
    name: Optional[RequiredStr] = Field(default=None, max_length=100)
    detail: Optional[str] = Field(default=None, max_length=500)
    due_date: Optional[date] = Field(default=None, alias="dueDate")


class TodoResponse(TodoBase):
    id: int
    owner: Optional[int] = Field(default=None, validation_alias="owner_id")
    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True, validate_by_name=True, validate_by_alias=True
    )
