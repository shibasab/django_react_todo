class AppError(Exception):
    """アプリケーション固有の例外の基底クラス"""

    pass


class NotFoundError(AppError):
    """リソースが見つからない場合のエラー"""

    pass


class DuplicateError(AppError):
    """リソースが重複している場合のエラー"""

    pass


class AuthenticationError(AppError):
    """認証に失敗した場合のエラー"""

    pass
