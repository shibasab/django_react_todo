class AppError(Exception):
    """アプリケーション固有の例外の基底クラス"""

    pass


class NotFoundError(AppError):
    """リソースが見つからない場合のエラー"""

    pass


class DuplicateError(AppError):
    """リソースが重複している場合のエラー"""

    def __init__(
        self, message: str = "Resource already exists", field: str = "unknown"
    ):
        super().__init__(message)
        self.field = field


class AuthenticationError(AppError):
    """認証に失敗した場合のエラー"""

    pass
