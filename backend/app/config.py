import os

# 環境変数から設定を読み込み
SECRET_KEY = os.environ.get("SECRET_KEY", "your-secret-key-for-jwt")

# JWT設定
JWT_SECRET_KEY = SECRET_KEY
JWT_ALGORITHM = "HS256"
JWT_ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7日間
