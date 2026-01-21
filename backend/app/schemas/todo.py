from pydantic import BaseModel, Field, ConfigDict, AfterValidator, WrapValidator
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


def validate_date_format(v, handler):
    """日付フォーマットのバリデーション

    すべてのパースエラーをinvalid_formatに統一
    """
    try:
        return handler(v)
    except Exception:
        # すべての日付パースエラーを統一されたエラータイプに変換
        raise PydanticCustomError(
            "invalid_format",
            "Invalid date format",
        ) from None


# 必須文字列型（空文字列を許可しない）
RequiredStr = Annotated[str, AfterValidator(validate_not_empty)]

# 検証済み日付型（すべてのパースエラーをinvalid_formatに統一）
ValidatedDate = Annotated[Optional[date], WrapValidator(validate_date_format)]


class TodoBase(BaseModel):
    name: RequiredStr = Field(..., max_length=100)
    detail: str = Field(default="", max_length=500)
    due_date: ValidatedDate = Field(default=None, alias="dueDate")
    is_completed: bool = Field(default=False, alias="isCompleted")


class TodoCreate(TodoBase):
    pass


def validate_optional_not_empty(v: str | None) -> str | None:
    """Optional文字列で、値が設定された場合は空でないことを確認"""
    if v is not None and (not v or not v.strip()):
        raise PydanticCustomError(
            "required",
            "Field is required",
        )
    return v


# Optional版の必須文字列型（値が設定された場合のみ空でないことをチェック）
OptionalRequiredStr = Annotated[
    Optional[str], AfterValidator(validate_optional_not_empty)
]


class TodoUpdate(BaseModel):
    """更新用スキーマ（部分更新対応）

    すべてのフィールドがOptionalで、リクエストに含まれるフィールドのみ更新される。
    ただしnameが指定された場合は空でないことをバリデーションする。
    """

    name: OptionalRequiredStr = Field(default=None, max_length=100)
    detail: Optional[str] = Field(default=None, max_length=500)
    due_date: ValidatedDate = Field(default=None, alias="dueDate")
    is_completed: Optional[bool] = Field(default=None, alias="isCompleted")


class TodoResponse(TodoBase):
    id: int
    owner: Optional[int] = Field(default=None, validation_alias="owner_id")
    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
        validate_by_name=True,
        validate_by_alias=True,
    )
