import pytest
from pydantic import ValidationError

from app.schemas.todo import TodoUpdate


def test_todo_update_allows_partial_payload() -> None:
    todo = TodoUpdate(name="買い物")

    assert todo.name == "買い物"


@pytest.mark.parametrize(
    "payload",
    [
        {"name": None},
        {"detail": None},
        {"isCompleted": None},
    ],
)
def test_todo_update_rejects_explicit_null(payload: dict[str, object]) -> None:
    with pytest.raises(ValidationError):
        TodoUpdate(**payload)


def test_todo_update_allows_null_due_date() -> None:
    todo = TodoUpdate(dueDate=None)

    assert todo.due_date is None
