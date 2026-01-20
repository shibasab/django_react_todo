# Frontend AGENTS.md

このドキュメントは、FrontendモジュールでAIエージェントが作業する際に必要な技術情報を提供します。

## 技術スタック

### コア技術

- **言語**: TypeScript（@typescript/native-preview 7系）
- **UIフレームワーク**: React 18系
- **ルーティング**: React Router 7系
- **ビルドツール**: Vite 7系
- **HTTPクライアント**: Axios
- **スタイリング**: Tailwind CSS 4系
- **パッケージ管理**: npm

詳細なバージョン情報は `package.json` を参照してください。

### UIライブラリ

- **通知**: react-toastify
- **アニメーション**: react-transition-group

### 開発ツール

- **フォーマッター**: oxfmt
- **リンター**: oxlint
- **型チェック**: tsgo
- **テストフレームワーク**: Vitest
- **テストユーティリティ**: @testing-library/react

## ディレクトリ構造

```shell
frontend/
├── src/
│   ├── App.tsx              # アプリケーションエントリーポイント・ルーティング
│   ├── index.tsx            # Reactルート・DOMマウント
│   ├── config.ts            # 定数管理（API_BASE_URL等）
│   ├── models/              # 型定義・ビジネスロジック
│   ├── services/            # 外部連携・アプリケーションロジック
│   ├── contexts/            # React Context
│   ├── hooks/               # カスタムフック
│   ├── layouts/             # レイアウトコンポーネント
│   ├── pages/               # ページコンポーネント
│   ├── components/          # UIコンポーネント
│   └── styles/
├── tests/                   # テストファイル
│   ├── setup.ts             # テストセットアップ
│   ├── helpers/             # テストヘルパー
│   ├── pages/               # ページテスト
│   └── services/
├── docs/
│   └── ARCHITECTURE.md      # アーキテクチャ詳細ドキュメント
├── package.json             # 依存関係・スクリプト
├── tsconfig.json            # TypeScript設定
├── vite.config.ts           # Vite設定
├── vitest.config.ts         # Vitest設定
├── .oxfmtrc.json            # oxfmt設定
└── .oxlintrc.json           # oxlint設定
```

## アーキテクチャパターン

### レイヤードアーキテクチャ

このプロジェクトはレイヤードアーキテクチャを採用しています。詳細は`docs/ARCHITECTURE.md`を参照してください。

| レイヤー       | 責務                                                                   | 依存可能なレイヤー                  |
| -------------- | ---------------------------------------------------------------------- | ----------------------------------- |
| **pages**      | ページコンポーネント、ルーティングに対応するトップレベルコンポーネント | models, hooks, contexts, components |
| **layouts**    | レイアウト構造、認証ガード、共通UI構造                                 | models, hooks, contexts, components |
| **components** | 再利用可能なUIコンポーネント                                           | models, hooks, contexts             |
| **hooks**      | 再利用可能なカスタムフック、状態管理ロジックのカプセル化               | models, services, contexts          |
| **contexts**   | React Contextによるグローバル状態管理                                  | models, services                    |
| **services**   | 外部連携・アプリケーションロジック、APIクライアント                    | models                              |
| **models**     | 型定義・ビジネスロジック、ドメインモデル                               | なし（独立）                        |

### 重要な原則

1. **models, servicesはReactに依存しない**
   - テスト容易性のため、models, servicesからcontexts/hooksを呼ばない
   - 循環依存を防ぐ

2. **下位レイヤーは上位レイヤーを知らない**
   - models, servicesはReactの存在を知らない
   - 純粋なJavaScript/TypeScriptとして実装

3. **componentsはpagesを知らない**
   - 再利用性を保つため、特定のページに依存しない

4. **グローバルな状態はContextで管理**
   - 認証状態: `AuthContext`
   - APIクライアント・ローディング状態: `ApiContext`

## コーディング規約とベストプラクティス

### コードフォーマット

- **フォーマッター**: oxfmt
- **実行**: `npm run format`
- **チェック**: `npm run format:check`

### リンター

- **ツール**: oxlint（type-awareモード）
- **実行**: `npm run lint`
- **自動修正**: `npm run lint:fix`

### 型チェック

- **ツール**: tsgo（TypeScript Go）
- **実行**: `npm run typecheck`

### 命名規則

- **コンポーネント**: PascalCase（例: `TodoForm`, `DashboardPage`）
- **関数・変数**: camelCase（例: `createTodo`, `authState`）
- **型・インターフェース**: PascalCase（例: `Todo`, `AuthState`）
- **定数**: UPPER_SNAKE_CASE（例: `API_BASE_URL`）
- **ファイル名**: PascalCase（コンポーネント）、camelCase（ユーティリティ）

### 型定義

- **Readonly型の使用を必須とする**: データはイミュータブルにし、`Readonly<T>`や`readonly T[]`を使用
- **型エイリアス**: `type`キーワードを使用（インターフェースではなく）
- **型の分離**: `models/`ディレクトリで型定義を集約

### エラーハンドリング

- **エラー型定義**: `models/error.ts`で型定義
- **Result型を使う**: `models/result.ts`で定義された`Result<T, E>`型を使用
- **APIエラー**: `api.ts`で`Result`型を返す（`post`, `put`メソッド）

### 状態管理

- **グローバル状態**: React Contextを使用
- **ローカル状態**: `useState`フックを使用

### カスタムフック

- **命名**: `use`プレフィックス（例: `useAuth`, `useTodo`）
- **責務**: 状態管理ロジックのカプセル化
- **再利用**: 複数のコンポーネントで使用可能なロジックを抽出

## 依存ライブラリとその使用方針

### 主要ライブラリ

#### React

- **用途**: UIフレームワーク
- **使用方針**:
  - 関数コンポーネントのみ使用
  - フックベースの実装
  - TSXでコンポーネントを定義

#### React Router

- **用途**: ルーティング
- **使用方針**:
  - `HashRouter`を使用（SPA用）
  - `Routes`と`Route`でルート定義
  - `PrivateLayout`と`PublicLayout`で認証ガード

#### Axios

- **用途**: HTTPクライアント
- **使用方針**:
  - `api.ts`でラップして使用
  - リクエストインターセプターでトークン自動付与
  - エラーハンドリングを統一

#### Tailwind CSS

- **用途**: スタイリング
- **使用方針**:
  - ユーティリティクラスでスタイリング
  - カスタムクラスは最小限に

### 開発依存ライブラリ

#### Vitest

- **用途**: テストフレームワーク
- **使用方針**:
  - `vitest.config.ts`で設定
  - `happy-dom`環境を使用

#### @testing-library/react

- **用途**: Reactコンポーネントのテスト
- **使用方針**:
  - ユーザーの振る舞い中心のテストを記述

## テスト戦略

### テストフレームワーク

- **フレームワーク**: Vitest
- **環境**: happy-dom（ブラウザ環境のシミュレーション）
- **設定**: `vitest.config.ts`

### テスト構成

```shell
tests/
├── setup.ts                    # テストセットアップ（グローバル設定）
├── helpers/                    # テストヘルパー
│   ├── apiMock.ts             # APIモック
│   ├── localStorageMock.ts    # localStorageモック
│   └── renderPage.tsx         # ページレンダリングヘルパー
├── pages/                      # ページテスト
│   ├── DashboardPage.test.tsx
│   ├── LoginPage.test.tsx
│   ├── LogoutFlow.test.tsx
│   ├── RegisterPage.test.tsx
│   └── __snapshots__/         # スナップショットテスト
└── services/
    └── validation.test.ts      # サービス層テスト
```

### テスト実行方法

```bash
# すべてのテストを実行
npm test

# ウォッチモード
npm test -- --watch

# カバレッジ付き
npm run test:coverage
```

### テストのベストプラクティス

1. **振る舞いベースのテスト**: ユーザーの視点でテストを記述（実装依存のテストはしない）
2. **モックの使用は最低限**: Web APIやlocalStorageなど外部依存のみモックを使用する
3. **スナップショットベース**: ページやコンポーネント単位のテストはスナップショットベースの検証を行う
4. **ヘルパーの活用**: `renderPage.tsx`などで共通処理を抽象化

## デバッグ方法

### 開発サーバーの起動

```bash
# 開発サーバーを起動（ホットリロード有効）
npm run dev
```

- デフォルトポート: 3000（Viteが自動選択）
- ホットリロード: ファイル保存時に自動リロード

### よくある問題と対処法

1. **型エラー**
   - `npm run typecheck`で型チェック
   - `tsconfig.json`の設定を確認

2. **API接続エラー**
   - `config.ts`の`API_BASE_URL`を確認
   - バックエンドサーバーが起動しているか確認

3. **認証エラー**
   - `localStorage`にトークンが保存されているか確認
   - トークンの有効期限を確認

## ビルドとデプロイ

### 開発ビルド

```bash
npm run dev
```

### 本番ビルド

```bash
npm run build
```

- 出力先: `dist/`ディレクトリ
- 最適化: コード分割、ミニファイ、Tree-shaking

### プレビュー

```bash
npm run preview
```

- 本番ビルドをローカルで確認

## 関連ドキュメント

- **プロジェクト全体**: [../AGENTS.md](../AGENTS.md)
- **アーキテクチャ詳細**: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- **Backend**: [../backend/AGENTS.md](../backend/AGENTS.md)
