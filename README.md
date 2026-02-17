# todoapp

FastAPI と React を使用した Todo アプリケーション

## 技術スタック

### バックエンド
- Python 3.13+
- FastAPI
- SQLAlchemy

### フロントエンド
- React
- React Router
- Axios
- Vite

## 必要な環境

- バックエンド: Python 3.13+ & uv
- フロントエンド: Node.js & npm

## 事前インストール

### バックエンド開発に必要なツール

バックエンドのセットアップには **Python** と **uv** のインストールが必要です。

```bash
# Pythonのバージョン確認（3.13以上を推奨）
python3 --version

# uvのインストール（macOS / Linux）
curl -LsSf https://astral.sh/uv/install.sh | sh

# uvのバージョン確認
uv --version
```

### フロントエンド開発に必要なツール

フロントエンドのセットアップには **Node.js** と **npm** のインストールが必要です。

```bash
# Node.jsとnpmのバージョン確認
node --version
npm --version
```

Node.jsを未インストールの場合は、公式サイトからLTS版をインストールしてください。

- Node.js: https://nodejs.org/

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

# 環境変数ファイルを作成
cp .env.example .env
# .envファイルを編集してSECRET_KEYを設定してください
```

> [!IMPORTANT]
> `SECRET_KEY` は本番環境では強力なランダム値を使用してください。

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
uv run uvicorn app.main:app --reload --port 8000
```

バックエンドサーバーは `http://localhost:8000` で起動します。

#### ターミナル2: フロントエンド開発サーバーの起動

```bash
cd frontend
npm run dev
```

フロントエンド開発サーバーは `http://localhost:3000` で起動します。

### アプリケーションへのアクセス

- **フロントエンド**: `http://localhost:3000`
- **APIドキュメント（Swagger UI）**: `http://localhost:8000/docs`
- **APIドキュメント（ReDoc）**: `http://localhost:8000/redoc`


## 開発ワークフロー

- **バックエンド**: ソースコード変更時は `--reload` オプションで自動リロード
- **フロントエンド**: `npm run dev` 実行中は保存時に自動的にホットリロード
- **本番ビルド**: `npm run build`

## トラブルシューティング

- **SECRET_KEY エラー**: `.env` ファイルに `SECRET_KEY` を設定してください
- **ポート競合**: 別のポート番号を指定してください（例: `--port 8001`）

## テスト

### バックエンドの自動テスト

```bash
cd backend
uv run pytest
```

## その他のコマンド

```bash
# コードフォーマット
uv run black .

# サーバー起動（本番モード）
uv run uvicorn app.main:app --host 0.0.0.0 --port 8000
```
