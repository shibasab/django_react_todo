# Frontend AGENTS.md

このドキュメントは、Frontend モジュールで AI エージェントが作業する際の技術情報をまとめたものです。

## 技術スタック

### コア技術

- **言語**: TypeScript（@typescript/native-preview 7系）
- **UIフレームワーク**: Vue 3
- **ルーティング**: Vue Router 5
- **状態管理**: Pinia
- **ビルドツール**: Vite 7系
- **HTTPクライアント**: Axios
- **スタイリング**: Tailwind CSS 4系
- **パッケージ管理**: npm

詳細なバージョンは `package.json` を参照してください。

### 開発ツール

- **フォーマッター**: oxfmt
- **リンター**: oxlint
- **型チェック**: vue-tsc
- **テストフレームワーク**: Vitest
- **テストユーティリティ**: @testing-library/vue

## ディレクトリ構造

```shell
frontend/
├── src/
│   ├── app.vue              # アプリケーションルート
│   ├── main.ts              # エントリーポイント
│   ├── config.ts            # 定数管理（API_BASE_URL等）
│   ├── models/              # 型定義・ドメインロジック
│   ├── services/            # API・ユーティリティ
│   ├── stores/              # Piniaストア
│   ├── composables/         # 再利用可能ロジック
│   ├── layouts/             # 共通レイアウト
│   ├── pages/               # ルーティング対応ページ
│   ├── components/          # 再利用UIコンポーネント
│   └── styles/
├── tests/
│   ├── setup.ts
│   ├── helpers/
│   ├── components/
│   ├── pages/
│   ├── services/
│   └── stores/
├── docs/
│   └── ARCHITECTURE.md
├── package.json
├── tsconfig.json
├── vite.config.ts
└── vitest.config.ts
```

## アーキテクチャ方針

- `models` / `services` は UI フレームワークに依存しない。
- `components` は `pages` へ依存しない。
- 共有状態は Pinia ストアへ集約し、ページ・コンポーネントはストアと composables を通じて利用する。

## 開発コマンド

```bash
npm run dev
npm run lint
npm run format
npm run typecheck
npm run test
npm run test:coverage
```

## 命名規則

- **Vue ファイル名**: kebab-case（例: `todo-list.vue`）
- **テストファイル名**: kebab-case（例: `todo-list.test.ts`）
- **関数・変数**: camelCase
- **型**: PascalCase
- **定数**: UPPER_SNAKE_CASE

## テスト方針

- 振る舞いベースで記述し、実装詳細に依存しない。
- 外部依存（API・Storage 等）のみモックする。
- 追加・変更時は関連テストを同一コミットに含める。
