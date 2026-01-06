from datetime import datetime, timedelta, timezone
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from passlib.context import CryptContext

# Django ORMを使用するためのセットアップ
import app.django_setup  # noqa: F401
from django.contrib.auth.models import User

from app.config import JWT_SECRET_KEY, JWT_ALGORITHM, JWT_ACCESS_TOKEN_EXPIRE_MINUTES

# パスワードハッシュ化
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Bearer認証スキーム
security = HTTPBearer()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """パスワードを検証"""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """パスワードをハッシュ化"""
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """JWTアクセストークンを作成"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    return encoded_jwt


def authenticate_user(username: str, password: str) -> Optional[User]:
    """ユーザーを認証"""
    try:
        user = User.objects.get(username=username)
        if user.check_password(password):
            return user
        return None
    except User.DoesNotExist:
        return None


def get_current_user_sync(credentials: HTTPAuthorizationCredentials = Depends(security)) -> User:
    """現在のユーザーを取得（トークンから）"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    try:
        user = User.objects.get(id=int(user_id))
        if not user.is_active:
            raise credentials_exception
        return user
    except User.DoesNotExist:
        raise credentials_exception
