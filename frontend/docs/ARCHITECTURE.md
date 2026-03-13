# Frontend Architecture

## レイヤー構成

```text
src/
├── main.ts            # エントリーポイント
├── app.vue            # ルートコンポーネント
├── router/            # ルーティング定義
├── pages/             # ページ単位UI
├── components/        # 再利用UI
├── layouts/           # 共通レイアウト
├── composables/       # 再利用ロジック
├── stores/            # Piniaストア
├── services/          # API・ユーティリティ
├── models/            # 型定義・ドメインロジック
└── styles/            # スタイル
```

## 依存ルール

- `models` は他レイヤーに依存しない。
- `services` は `models` にのみ依存する。
- `stores` / `composables` は `models` と `services` に依存する。
- `components` は `pages` を参照しない。
- `pages` は `components` / `stores` / `composables` を組み合わせる。

## 状態管理

- グローバル状態は Pinia を利用する。
- 認証状態は `stores/auth.ts`、API 呼び出しのローディング状態は `stores/api.ts` で管理する。

## ルーティング

- Vue Router（Hash History）を利用。
- 認証ガードは `router/index.ts` の `beforeEach` で実施する。

## 型検査とLint

- 型チェックは `vue-tsc` を利用する。
- Lint は `oxlint` を利用し、frontend では `tsgo` / `oxlint-tsgolint` に依存しない。

## テスト戦略

- Vitest + happy-dom + @testing-library/vue。
- 単体テストは振る舞い中心で記述し、外部依存のみモックする。
- カバレッジ計測は `src/**/*.{ts,vue}` を対象とし、テストコードは除外する。
