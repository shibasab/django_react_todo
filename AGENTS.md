# AGENTS.md

このドキュメントは、このプロジェクトでAIエージェントが作業する際に必要なコンテキスト情報を提供します。

## プロジェクト概要

### ビジネス目的

このプロジェクトは、FastAPIとReactを使用したTodo（タスク管理）アプリケーションです。ユーザーは認証を行い、自分のTodoを作成・更新・削除・一覧表示できます。

### ドメイン概要

- **ユーザー認証**: JWTベースの認証システム
- **Todo管理**: ユーザーごとのタスク管理機能
- **マルチテナント**: 各ユーザーは自分のTodoのみアクセス可能

## モノレポ構成

```shell
todoapp/
├── backend/          # FastAPIバックエンド
├── frontend/         # Reactフロントエンド
├── docs/             # 仕様書・非機能要件管理
│   ├── specs/        # 機能仕様（Spec）
│   └── nfr/          # 非機能要件（NFR）
├── .cursor/          # Cursor設定
│   └── skills/       # Cursorスキル定義
└── .agent/           # エージェントワークフロー定義
```

### モジュール間の関係性

```shell
┌─────────────┐         HTTP/REST API         ┌─────────────┐
│  Frontend   │ ────────────────────────────▶ │  Backend     │
│  (React)    │ ◀──────────────────────────── │  (FastAPI)   │
└─────────────┘         JWT Bearer Token      └─────────────┘
```

- **通信方式**: RESTful API over HTTP
- **認証方式**: JWT Bearer Token
- **API Base URL**: `/api`
- **CORS**: 開発環境では全オリジンを許可

## 共通開発規約

### ブランチ戦略

- **メインブランチ**: `master`（または`main`）
- 機能開発はブランチを切って作業し、マージ前にレビューを実施

### コミットルール

以下のベストプラクティスを守ること:

- コミットメッセージは簡潔で明確に
- 関連する変更は1つのコミットにまとめる
- 機能追加・修正・リファクタリングを区別する

### 仕様管理

- **機能仕様**: `docs/specs/`で管理
  - `docs/specs/000_backlog/`: アイデア段階の仕様
  - `docs/specs/NNN_feature/`: 実装着手可能な仕様（Ready以上）
  - 詳細は `docs/spec-workflow.md` を参照

### 非機能要件管理

- **NFR**: `docs/nfr/`で管理
  - `docs/nfr/000_backlog/`: アイデア段階のNFR
  - `docs/nfr/NNN_topic/`: 実装着手可能なNFR（Ready以上）
  - 詳細は `docs/nfr-workflow.md` を参照

### エージェントへの依頼ルール

- 実装依頼の前に、対象Spec（`specs/NNN_feature/spec.md`）またはNFR（`nfr/NNN_topic/nfr.md`）を必ず参照させる
- Specに書いてない仕様は「未決」とみなす（勝手に補完しない）

## ドメイン用語集

### コアエンティティ

- **User（ユーザー）**: アプリケーションの利用者
  - `id`: ユーザーID（主キー）
  - `username`: ユーザー名（一意）
  - `email`: メールアドレス（オプション）
  - `hashed_password`: ハッシュ化されたパスワード

- **Todo（タスク）**: ユーザーが管理するタスク
  - `id`: Todo ID（主キー）
  - `name`: タスク名（必須、最大100文字、同一ユーザー内で一意）
  - `detail`: タスクの詳細説明（オプション、最大500文字）
  - `due_date`: 期限日（オプション、日付形式）
  - `created_at`: 作成日時（自動設定）
  - `owner_id`: 所有者のユーザーID（外部キー）

### 認証・認可

- **Authentication（認証）**: ユーザーの身元確認
  - JWT（JSON Web Token）ベース
  - トークン有効期限: 7日間
  - エンドポイント: `/api/auth/login`, `/api/auth/register`

- **Authorization（認可）**: リソースへのアクセス権限
  - ユーザーは自分のTodoのみ操作可能
  - 他のユーザーのTodoへのアクセスは拒否される

### その他

- **Owner（所有者）**: Todoを所有するユーザー
- **Task**: Todoの別名（同義語）

## 共通ビジネスルール

### Todoに関するルール

1. **名前の一意性**: Todo名は同一ユーザー内で一意でなければならない
   - 例: ユーザーAが「買い物」というTodoを作成済みの場合、同じユーザーAは再度「買い物」という名前のTodoを作成できない

2. **所有権**: Todoは所有者のみが操作可能
   - 作成・取得・更新・削除は所有者のみが実行可能
   - 他のユーザーのTodo IDを指定してもアクセスできない

3. **必須フィールド**: `name`は必須、`detail`と`due_date`はオプション

4. **文字数制限**:
   - `name`: 最大100文字
   - `detail`: 最大500文字

### 認証に関するルール

1. **JWTトークン**: ログイン・登録時に発行され、7日間有効
2. **パスワード**: bcryptでハッシュ化して保存
3. **ユーザー名**: システム全体で一意でなければならない

## 開発環境

### バックエンド

- **言語**: Python 3.13系
- 詳細な依存関係は `backend/pyproject.toml` を参照してください

### フロントエンド

- **言語**: TypeScript
- 詳細な依存関係は `frontend/package.json` を参照してください

## 関連ドキュメント

- **Backend詳細**: [backend/AGENTS.md](backend/AGENTS.md)
- **Frontend詳細**: [frontend/AGENTS.md](frontend/AGENTS.md)
- **Backendアーキテクチャ**: [backend/docs/ARCHITECTURE.md](backend/docs/ARCHITECTURE.md)
- **Frontendアーキテクチャ**: [frontend/docs/ARCHITECTURE.md](frontend/docs/ARCHITECTURE.md)
- **機能仕様管理**: [docs/spec-workflow.md](docs/spec-workflow.md)
- **非機能要件管理**: [docs/nfr-workflow.md](docs/nfr-workflow.md)
