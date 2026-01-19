# Backend AGENTS.md

このドキュメントは、BackendモジュールでAIエージェントが作業する際に必要な技術情報を提供します。

## 技術スタック

### コア技術

- **言語**: Python 3.13系
- **Webフレームワーク**: FastAPI
- **ORM**: SQLAlchemy 2系
- **データベース**: SQLite
- **認証**: JWT（python-jose）
- **パスワードハッシュ**: bcrypt
- **バリデーション**: Pydantic（FastAPIに含まれる）
- **パッケージ管理**: uv

詳細なバージョン情報は `pyproject.toml` を参照してください。

### 開発ツール

- **フォーマッター・リンター**: Ruff
- **型チェック**: pyrefly
- **Pre-commit**: pre-commit
- **テストフレームワーク**: pytest

詳細なバージョン情報は `pyproject.toml` を参照してください。

## ディレクトリ構造

```shell
backend/
├── app/
│   ├── main.py              # FastAPIアプリケーションエントリーポイント
│   ├── config.py             # 環境設定・定数管理
│   ├── database.py           # DB接続・Session管理・Baseクラス
│   ├── exceptions.py          # ドメイン例外定義
│   ├── handlers.py           # 例外ハンドラー（HTTP例外への変換）
│   ├── dependencies/         # DI用の依存解決
│   ├── routers/              # APIルーティング
│   ├── services/             # ユースケース・アプリケーションロジック
│   ├── repositories/         # 永続化アクセス層
│   ├── models/               # DBモデル（SQLAlchemy）
│   └── schemas/              # REST APIスキーマ（Pydantic）
├── tests/                    # テストファイル
├── docs/
│   └── ARCHITECTURE.md       # アーキテクチャ詳細ドキュメント
├── pyproject.toml            # プロジェクト設定・依存関係
├── pyrefly.toml              # pyrefly設定
├── .pre-commit-config.yaml   # Pre-commit設定
└── uv.lock                   # uv依存関係ロックファイル
```

## アーキテクチャパターン

### レイヤードアーキテクチャ

このプロジェクトはレイヤードアーキテクチャを採用しています。詳細は`docs/ARCHITECTURE.md`を参照してください。

| レイヤー | 責務 | 依存可能なレイヤー |
| --------- | ---- | ------------------ |
| **routers** | HTTPエンドポイント定義、リクエスト/レスポンス変換 | schemas, services, dependencies, exceptions |
| **dependencies** | 依存解決・認証、サービス注入、認証済みユーザー取得 | services, repositories, database |
| **services** | ユースケース実装、アプリケーション層のビジネスロジック | repositories, models, schemas, exceptions |
| **repositories** | 永続化アクセス、データアクセス層のCRUD操作 | models, database |
| **models** | DBモデル、ドメインモデル（SQLAlchemy） | database（Baseのみ） |
| **schemas** | APIスキーマ（Pydantic）、API層の型定義 | なし（独立） |
| **handlers** | 例外ハンドラー、HTTP例外への変換 | exceptions, schemas |
| **main/config/database** | アプリケーション基盤、設定、DB接続 | すべて可能 |

### 重要な原則

1. **routersはユースケースの組み立てに集中**
   - 直接DB操作や複雑なロジックを持たない
   - 依存解決は`dependencies`に委譲

2. **servicesは永続化の詳細を知らない**
   - `repositories`を通じてDBを操作
   - テスト時に差し替え可能な設計

3. **schemasとmodelsを分離**
   - API表現とDB表現を独立させる
   - 変更影響を局所化

4. **例外処理の分離**
   - Services層はドメイン例外（`AppError`サブクラス）を投げる
   - Routers層でHTTP例外（`HTTPException`）に変換

## コーディング規約とベストプラクティス

### コードフォーマット

- **フォーマッター**: Ruff（`ruff format`）
- **Pre-commit**: コミット前に自動フォーマット

### リンター

- **ツール**: Ruff

### 型チェック

- **ツール**: pyrefly

### 命名規則

- **クラス**: PascalCase（例: `TodoService`, `TodoRepository`）
- **関数・メソッド**: snake_case（例: `get_todo`, `create_todo`）
- **定数**: UPPER_SNAKE_CASE（例: `SECRET_KEY`, `DATABASE_URL`）
- **プライベートメソッド**: `_`プレフィックス（例: `_validate_todo`）

### 例外処理

- **ドメイン例外**: `app/exceptions.py`で定義
- **例外の変換**: `handlers.py`でHTTP例外に変換

### 依存性注入（DI）

- FastAPIの`Depends`を使用

### バリデーション

- **API層**: Pydanticスキーマでバリデーション
- **ビジネス層**: Services層でビジネスルールを検証
- **型安全性**: `NewType`を使用してバリデーション済みデータを型で区別（例: `ValidatedTodoData`）

## 依存ライブラリとその使用方針

### 主要ライブラリ

#### FastAPI

- **用途**: Webフレームワーク、API定義
- **使用方針**:  
  - ルーターは`APIRouter`を使用
  - レスポンスモデルは`response_model`で指定
  - ステータスコードは`status_code`で明示

#### SQLAlchemy

- **用途**: ORM、データベース操作
- **使用方針**:
  - SQLAlchemy 2.0スタイル（`Mapped`型アノテーション）
  - `Session`は`dependencies`で管理

#### Pydantic

- **用途**: リクエスト/レスポンスのバリデーション
- **使用方針**:
  - カスタムバリデーターは`Annotated`と`AfterValidator`を使用
  - `ConfigDict`で設定を管理

#### python-jose

- **用途**: JWTトークンの生成・検証

#### passlib / bcrypt

- **用途**: パスワードハッシュ化
- **使用方針**:
  - `CryptContext`を使用
  - `set_password`でハッシュ化
  - `check_password`で検証

### 開発依存ライブラリ

#### pytest

- **用途**: テストフレームワーク
- **使用方針**:
  - `conftest.py`でフィクスチャを定義
  - `TestClient`でAPIテスト
  - インメモリSQLiteでテストDBを使用

#### ruff

- **用途**: フォーマッター・リンター
- **使用方針**:
  - Pre-commitフックで自動実行
  - `pyproject.toml`で設定

## テスト戦略

### テストフレームワーク

- **フレームワーク**: pytest
- **HTTPクライアント**: httpx（FastAPIの`TestClient`経由）

### テスト構成

```shell
tests/
├── conftest.py              # 共通フィクスチャ
│   ├── test_db             # テスト用DBセッション（各テストでリセット）
│   ├── client              # FastAPI TestClient
│   ├── test_user           # テスト用ユーザー
│   └── auth_headers        # 認証ヘッダー
├── test_auth.py            # 認証機能のテスト
├── test_todo.py            # Todo機能のテスト
└── test_todo_deadline.py   # Todo期限機能のテスト
```

### テスト実行方法

```bash
# すべてのテストを実行
uv run pytest

# 特定のファイルのテストを実行
uv run pytest tests/test_todo.py

# カバレッジ（将来追加可能）
# uv run pytest --cov=app tests/
```

### テスト実装方針

1. **振る舞いベースの検証を行う**: APIテストで振る舞いを検証する
2. **モックの仕様は最低限**: テスト時のモックが最小限になるようアプリケーション実装を行う
3. **各テストは独立**: テスト間で状態を共有しない

## デバッグ方法

### 開発サーバーの起動

```bash
# リロード付きで開発サーバーを起動
uv run uvicorn app.main:app --reload --port 8000
```

### データベース確認

- SQLiteデータベースファイル: `todo.db`（プロジェクトルート）
- SQLiteクライアントで直接確認可能

### よくある問題と対処法

1. **インポートエラー**
   - `uv sync`で依存関係を再インストール

2. **データベースエラー**
   - `todo.db`を削除して再作成

3. **認証エラー**
   - `.env`ファイルに`SECRET_KEY`が設定されているか確認

## 環境変数

### 必須環境変数

- `SECRET_KEY`: JWT署名用の秘密鍵（本番環境では強力なランダム値を使用）

### オプション環境変数

- `DATABASE_URL`: データベースURL（デフォルト: `sqlite:///./todo.db`）

### 設定ファイル

- `.env`: 環境変数を定義（`.env.example`をコピーして作成）

## 関連ドキュメント

- **プロジェクト全体**: [../AGENTS.md](../AGENTS.md)
- **アーキテクチャ詳細**: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- **Frontend**: [../frontend/AGENTS.md](../frontend/AGENTS.md)
