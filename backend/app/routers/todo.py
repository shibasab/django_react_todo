from typing import List
from fastapi import APIRouter, Depends, status

from app.models.user import User
from app.schemas.todo import TodoCreate, TodoUpdate, TodoResponse
from app.dependencies.auth import get_current_user
from app.dependencies.container import get_todo_service
from app.services.todo import TodoService

router = APIRouter()


@router.get("/", response_model=List[TodoResponse])
def list_todos(
    current_user: User = Depends(get_current_user),
    service: TodoService = Depends(get_todo_service),
):
    """現在のユーザーのTodo一覧を取得"""
    todos = service.get_todos(current_user.id)  # pyrefly: ignore[bad-argument-type]
    return [TodoResponse.model_validate(todo) for todo in todos]


@router.post("/", response_model=TodoResponse, status_code=status.HTTP_201_CREATED)
def create_todo(
    todo_data: TodoCreate,
    current_user: User = Depends(get_current_user),
    service: TodoService = Depends(get_todo_service),
):
    """Todoを作成"""
    todo = service.create_todo(
        todo_data,
        current_user.id,  # pyrefly: ignore[bad-argument-type]
    )
    return TodoResponse.model_validate(todo)


@router.get("/{todo_id}/", response_model=TodoResponse)
def get_todo(
    todo_id: int,
    current_user: User = Depends(get_current_user),
    service: TodoService = Depends(get_todo_service),
):
    """Todoを取得"""
    todo = service.get_todo(
        todo_id,
        current_user.id,  # pyrefly: ignore[bad-argument-type]
    )
    return TodoResponse.model_validate(todo)


@router.put("/{todo_id}/", response_model=TodoResponse)
def update_todo(
    todo_id: int,
    todo_data: TodoCreate,
    current_user: User = Depends(get_current_user),
    service: TodoService = Depends(get_todo_service),
):
    """Todoを更新（全置換）"""
    todo = service.update_todo(
        todo_id,
        todo_data,
        current_user.id,  # pyrefly: ignore[bad-argument-type]
    )
    return TodoResponse.model_validate(todo)


@router.patch("/{todo_id}/", response_model=TodoResponse)
def partial_update_todo(
    todo_id: int,
    todo_data: TodoUpdate,
    current_user: User = Depends(get_current_user),
    service: TodoService = Depends(get_todo_service),
):
    """Todoを部分更新"""
    todo = service.partial_update_todo(
        todo_id,
        todo_data,
        current_user.id,  # pyrefly: ignore[bad-argument-type]
    )
    return TodoResponse.model_validate(todo)


@router.delete("/{todo_id}/", status_code=status.HTTP_204_NO_CONTENT)
def delete_todo(
    todo_id: int,
    current_user: User = Depends(get_current_user),
    service: TodoService = Depends(get_todo_service),
):
    """Todoを削除"""
    service.delete_todo(todo_id, current_user.id)  # pyrefly: ignore[bad-argument-type]
    return None
