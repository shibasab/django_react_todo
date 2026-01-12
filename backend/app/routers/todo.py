from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.todo import Todo
from app.schemas.todo import TodoCreate, TodoUpdate, TodoResponse
from app.dependencies.auth import get_current_user

router = APIRouter()


@router.get("/", response_model=List[TodoResponse])
def list_todos(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """現在のユーザーのTodo一覧を取得"""
    todos = db.query(Todo).filter(Todo.owner_id == current_user.id).order_by(Todo.created_at.desc()).all()
    return [
        TodoResponse(
            id=todo.id,
            name=todo.name,
            detail=todo.detail or "",
            owner=todo.owner_id,
            created_at=todo.created_at
        )
        for todo in todos
    ]


@router.post("/", response_model=TodoResponse, status_code=status.HTTP_201_CREATED)
def create_todo(
    todo_data: TodoCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Todoを作成"""
    todo = Todo(
        name=todo_data.name,
        detail=todo_data.detail or "",
        owner_id=current_user.id
    )
    db.add(todo)
    db.commit()
    db.refresh(todo)

    return TodoResponse(
        id=todo.id,
        name=todo.name,
        detail=todo.detail or "",
        owner=todo.owner_id,
        created_at=todo.created_at
    )


@router.get("/{todo_id}/", response_model=TodoResponse)
def get_todo(
    todo_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Todoを取得"""
    todo = db.query(Todo).filter(Todo.id == todo_id, Todo.owner_id == current_user.id).first()
    if not todo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Todo not found"
        )
    return TodoResponse(
        id=todo.id,
        name=todo.name,
        detail=todo.detail or "",
        owner=todo.owner_id,
        created_at=todo.created_at
    )


@router.put("/{todo_id}/", response_model=TodoResponse)
def update_todo(
    todo_id: int,
    todo_data: TodoCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Todoを更新（全置換）"""
    todo = db.query(Todo).filter(Todo.id == todo_id, Todo.owner_id == current_user.id).first()
    if not todo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Todo not found"
        )

    todo.name = todo_data.name
    todo.detail = todo_data.detail or ""
    db.commit()
    db.refresh(todo)

    return TodoResponse(
        id=todo.id,
        name=todo.name,
        detail=todo.detail or "",
        owner=todo.owner_id,
        created_at=todo.created_at
    )


@router.patch("/{todo_id}/", response_model=TodoResponse)
def partial_update_todo(
    todo_id: int,
    todo_data: TodoUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Todoを部分更新"""
    todo = db.query(Todo).filter(Todo.id == todo_id, Todo.owner_id == current_user.id).first()
    if not todo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Todo not found"
        )

    if todo_data.name is not None:
        todo.name = todo_data.name
    if todo_data.detail is not None:
        todo.detail = todo_data.detail
    db.commit()
    db.refresh(todo)

    return TodoResponse(
        id=todo.id,
        name=todo.name,
        detail=todo.detail or "",
        owner=todo.owner_id,
        created_at=todo.created_at
    )


@router.delete("/{todo_id}/", status_code=status.HTTP_204_NO_CONTENT)
def delete_todo(
    todo_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Todoを削除"""
    todo = db.query(Todo).filter(Todo.id == todo_id, Todo.owner_id == current_user.id).first()
    if not todo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Todo not found"
        )

    db.delete(todo)
    db.commit()
    return None
