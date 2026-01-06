from fastapi import APIRouter, Depends, HTTPException, status
from django.contrib.auth.models import User

from app.schemas.user import UserCreate, UserLogin, UserResponse, TokenResponse
from app.dependencies.auth import (
    authenticate_user,
    create_access_token,
    get_current_user_sync,
)

router = APIRouter()


@router.post("/register", response_model=TokenResponse)
def register(user_data: UserCreate):
    """ユーザー登録"""
    # ユーザー名の重複チェック
    if User.objects.filter(username=user_data.username).exists():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )

    # ユーザー作成
    user = User.objects.create_user(
        username=user_data.username,
        email=user_data.email or "",
        password=user_data.password,
    )

    # トークン生成
    token = create_access_token(data={"sub": str(user.id)})

    return TokenResponse(
        user=UserResponse(id=user.id, username=user.username, email=user.email),
        token=token
    )


@router.post("/login", response_model=TokenResponse)
def login(credentials: UserLogin):
    """ログイン"""
    user = authenticate_user(credentials.username, credentials.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect Credentials"
        )

    # トークン生成
    token = create_access_token(data={"sub": str(user.id)})

    return TokenResponse(
        user=UserResponse(id=user.id, username=user.username, email=user.email),
        token=token
    )


@router.post("/logout")
def logout(current_user: User = Depends(get_current_user_sync)):
    """ログアウト"""
    return {"detail": "Successfully logged out"}


@router.get("/user", response_model=UserResponse)
def get_user(current_user: User = Depends(get_current_user_sync)):
    """ユーザー情報を取得"""
    return UserResponse(
        id=current_user.id,
        username=current_user.username,
        email=current_user.email
    )
