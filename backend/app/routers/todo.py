from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from django.contrib.auth.models import User

# Django ORMを使用するためのセットアップ
import app.django_setup  # noqa: F401
from todo.models import Todo

from app.schemas.todo import TodoCreate, TodoUpdate, TodoResponse
from app.dependencies.auth import get_current_user_sync

router = APIRouter()


@router.get("/", response_model=List[TodoResponse])
def list_todos(current_user: User = Depends(get_current_user_sync)):
    """現在のユーザーのTodo一覧を取得"""
    todos = Todo.objects.filter(owner=current_user).order_by("-created_at")
    return [
        TodoResponse(
            id=todo.id,
            todo_task=todo.todo_task,
            detail=todo.detail,
            owner=todo.owner_id,
            created_at=todo.created_at
        )
        for todo in todos
    ]


@router.post("/", response_model=TodoResponse, status_code=status.HTTP_201_CREATED)
def create_todo(todo_data: TodoCreate, current_user: User = Depends(get_current_user_sync)):
    """Todoを作成"""
    todo = Todo.objects.create(
        todo_task=todo_data.todo_task,
        detail=todo_data.detail or "",
        owner=current_user
    )
    return TodoResponse(
        id=todo.id,
        todo_task=todo.todo_task,
        detail=todo.detail,
        owner=todo.owner_id,
        created_at=todo.created_at
    )


@router.get("/{todo_id}/", response_model=TodoResponse)
def get_todo(todo_id: int, current_user: User = Depends(get_current_user_sync)):
    """Todoを取得"""
    try:
        todo = Todo.objects.get(id=todo_id, owner=current_user)
    except Todo.DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Todo not found"
        )
    return TodoResponse(
        id=todo.id,
        todo_task=todo.todo_task,
        detail=todo.detail,
        owner=todo.owner_id,
        created_at=todo.created_at
    )


@router.put("/{todo_id}/", response_model=TodoResponse)
def update_todo(
    todo_id: int,
    todo_data: TodoCreate,
    current_user: User = Depends(get_current_user_sync)
):
    """Todoを更新（全置換）"""
    try:
        todo = Todo.objects.get(id=todo_id, owner=current_user)
    except Todo.DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Todo not found"
        )

    todo.todo_task = todo_data.todo_task
    todo.detail = todo_data.detail or ""
    todo.save()

    return TodoResponse(
        id=todo.id,
        todo_task=todo.todo_task,
        detail=todo.detail,
        owner=todo.owner_id,
        created_at=todo.created_at
    )


@router.patch("/{todo_id}/", response_model=TodoResponse)
def partial_update_todo(
    todo_id: int,
    todo_data: TodoUpdate,
    current_user: User = Depends(get_current_user_sync)
):
    """Todoを部分更新"""
    try:
        todo = Todo.objects.get(id=todo_id, owner=current_user)
    except Todo.DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Todo not found"
        )

    if todo_data.todo_task is not None:
        todo.todo_task = todo_data.todo_task
    if todo_data.detail is not None:
        todo.detail = todo_data.detail
    todo.save()

    return TodoResponse(
        id=todo.id,
        todo_task=todo.todo_task,
        detail=todo.detail,
        owner=todo.owner_id,
        created_at=todo.created_at
    )


@router.delete("/{todo_id}/", status_code=status.HTTP_204_NO_CONTENT)
def delete_todo(todo_id: int, current_user: User = Depends(get_current_user_sync)):
    """Todoを削除"""
    try:
        todo = Todo.objects.get(id=todo_id, owner=current_user)
    except Todo.DoesNotExist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Todo not found"
        )
    
    todo.delete()
    return None
