from sqlalchemy import Column, Integer, String, Boolean
from app.database import Base
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(150), unique=True, index=True, nullable=False)
    email = Column(String(254), default="")
    hashed_password = Column(String(128), nullable=False)
    is_active = Column(Boolean, default=True)

    def set_password(self, password: str):
        """パスワードをハッシュ化して設定"""
        self.hashed_password = pwd_context.hash(password)

    def check_password(self, password: str) -> bool:
        """パスワードを検証"""
        return pwd_context.verify(password, self.hashed_password)
