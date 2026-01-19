# Backend Architecture

## レイヤー構成

```
backend/app/
├── main.py           # アプリケーションエントリーポイント
├── config.py         # 環境設定・定数
├── database.py       # DB接続・Session管理
├── handlers.py       # 例外ハンドラー
├── exceptions.py     # ドメイン例外
├── dependencies/     # DI用の依存解決
├── routers/          # APIルーティング
├── services/         # ユースケース・アプリケーションロジック
├── repositories/     # 永続化アクセス
├── models/           # DBモデル
└── schemas/          # REST APIスキーマ
```

---

## レイヤーの役割と責務

### models/

**役割**: データベースのドメインモデル定義

- SQLAlchemyのモデル定義
- DBの構造に関する責務を持つ
- 直接API層やルーティングには依存しない

### schemas/

**役割**: API入出力のスキーマ定義

- Pydanticによるリクエスト/レスポンス型
- バリデーションの責務
- DBモデルとAPI表現を分離する

### repositories/

**役割**: 永続化アクセスの抽象化

- CRUDなどのDB操作を集約
- Sessionに依存し、ドメイン操作の詳細を隠蔽
- servicesから呼び出される

### services/

**役割**: ユースケース実装

- ルールや操作手順をまとめたアプリケーションロジック
- repositoriesを組み合わせて処理を実現
- 例外をドメイン例外として整形

### routers/

**役割**: HTTPエンドポイント定義

- ルーティングと入力/出力の組み立て
- dependenciesを使ってサービスを注入
- 例外をHTTPエラーに変換

### dependencies/

**役割**: 依存解決と認証

- DB SessionやServiceの生成
- 認証済みユーザー取得などの横断的関心事

### handlers.py / exceptions.py

**役割**: 例外処理の集約

- ドメイン例外をHTTPレスポンスに変換
- バリデーションエラーの整形

### database.py / config.py / main.py

**役割**: アプリケーション基盤

- DB接続、設定、エントリーポイント
- ルーターや例外ハンドラーの登録

---

## 依存関係ルール

| レイヤー           | 依存可能                               |
| ------------------ | -------------------------------------- |
| **models**         | なし                                   |
| **schemas**        | なし                                   |
| **repositories**   | models, database                       |
| **services**       | repositories, models, schemas, exceptions |
| **dependencies**   | services, repositories, database       |
| **routers**        | schemas, services, dependencies, exceptions |
| **handlers**       | exceptions, schemas                    |
| **main/config/db** | すべて可能                             |

---

## 依存関係図

```
          ┌──────────────────────────────────────────┐
          │                 main.py                  │
          │           (エントリーポイント)           │
          └───────────────────┬──────────────────────┘
                              │
                 ┌────────────┼────────────┐
                 ▼            ▼            ▼
           ┌──────────┐  ┌──────────┐  ┌──────────┐
           │ handlers │  │ routers  │  │ database │
           └────┬─────┘  └────┬─────┘  └────┬─────┘
                │            │            │
                │            ▼            │
                │     ┌──────────────┐    │
                │     │ dependencies │    │
                │     └──────┬───────┘    │
                │            ▼            │
                │     ┌──────────┐        │
                │     │ services │◀───────┘
                │     └────┬─────┘
                │          ▼
                │    ┌────────────┐
                │    │ repositories│
                │    └────┬───────┘
                │          ▼
                │    ┌──────────┐
                └───▶│  models  │
                     └──────────┘

           ┌──────────┐
           │ schemas  │
           └──────────┘
```

---

## 重要な原則

1. **routers はユースケースの組み立てに集中する**
   - 直接DB操作や複雑なロジックを持たない
   - 依存解決はdependenciesに委譲する

2. **services は永続化の詳細を知らない**
   - repositoriesを通じてDBを操作する
   - テスト時に差し替え可能

3. **schemas と models を分離する**
   - API表現とDB表現を独立させる
   - 変更影響を局所化する
