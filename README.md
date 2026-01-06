# todoapp

Django REST Framework と React を使用した Todo アプリケーション

## 技術スタック

### バックエンド
- Python
- Django
- Django REST Framework
- Django REST Knox（トークン認証）
- SQLite3

### フロントエンド
- React
- Redux
- React Router
- Axios

## 必要な環境

- バックエンド: Python & uv
- フロントエンド: Node.js & npm

## セットアップ手順

### 1. リポジトリのクローン

```bash
git clone <repository-url>
cd todoapp
```

### 2. バックエンドのセットアップ

```bash
cd backend

# uvで仮想環境を作成し、依存関係をインストール
uv sync

# 環境変数を設定（重要）
# Windows (Git Bash)
export SECRET_KEY="your-secret-key-here"

# データベースマイグレーションを実行
uv run python manage.py migrate

# スーパーユーザーを作成（オプション）
uv run python manage.py createsuperuser
```

> [!IMPORTANT]
> `SECRET_KEY` 環境変数の設定は必須です。本番環境では安全な値を使用してください。

### 3. フロントエンドのセットアップ

```bash
cd ../frontend

# 依存関係をインストール
npm install
```

## アプリケーションの起動

### 開発モード

2つのターミナルを開いて、それぞれで以下を実行します。

#### ターミナル1: バックエンドサーバーの起動

```bash
cd backend
export SECRET_KEY="your-secret-key-here"  # 環境変数を設定
uv run python manage.py runserver
```

バックエンドサーバーは `http://localhost:8000` で起動します。

#### ターミナル2: フロントエンド開発サーバーの起動

```bash
cd frontend
npm run dev
```

このコマンドはWebpackをウォッチモードで起動し、ソースコードの変更を自動的にバンドルします。

### アプリケーションへのアクセス

ブラウザで `http://localhost:8000` にアクセスしてアプリケーションを使用できます。

## 開発ワークフロー

- **バックエンド**: モデル変更後は `uv run python manage.py makemigrations` と `uv run python manage.py migrate` を実行
- **フロントエンド**: `npm run dev` 実行中は保存時に自動的に再バンドル
- **本番ビルド**: `npm run build`

## トラブルシューティング

- **SECRET_KEY エラー**: 環境変数 `SECRET_KEY` を設定してください
- **マイグレーションエラー**: `uv run python manage.py migrate --run-syncdb`

## その他のコマンド

- Django管理画面: `http://localhost:8000/admin`
- テスト実行: `uv run python manage.py test`
- コードフォーマット: `uv run black .`
- OpenAPI スキーマ生成: `uv run python manage.py generateschema --format openapi > schema.yml`


