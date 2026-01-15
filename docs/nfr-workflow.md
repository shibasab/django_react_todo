# 非機能要件（NFR）管理の運用ルール

このリポジトリでは、非機能（品質特性）に関する改善タスクも実装前に「要件・仕様（WHAT/WHY）」をMarkdownで管理する。
※実装計画（HOW）や影響範囲の詳細などは実装着手前に作成するため、Markdownには記載しない。

## 目的
- エージェントに渡すブレない要求を残す
- 実装と仕様の同期をGitで追えるようにする
- 非機能の分類は ISO/IEC 25010 の品質特性をベースにする
  - Performance efficiency / Reliability / Security / Maintainability / Usability / Compatibility / Portability

## ディレクトリ構成
- nfr/000_backlog/: アイデア（軽量NFR）
- nfr/NNN_topic/: 着手するNFR（Ready以上）

## NFRの状態（Status）
- Idea: アイデア段階（000_backlog配下）
- Ready: 着手OK（受け入れ条件が揃っている）
- In progress: 実装中
- Done: 完了（原則凍結）
- Abandoned: 中止（理由だけ残す）

## ファイル規約
### 1) アイデア（軽量NFR）
- path: nfr/000_backlog/\<slug\>.md
- 必須: Goal / Quality attributes / Non-goals / Acceptance criteria（粗くてOK）

### 2) 着手NFR（要件・仕様のみ）
- path: nfr/\<NNN\>_\<topic\>/nfr.md
- 必須:
  - Goal（1〜2文）
  - Quality attributes（ISO/IEC 25010）
  - Non-goals
  - Scenarios & Testing（Given/When/Then）
  - Edge cases / Risks
  - Requirements（NFR-001形式、MUST/SHOULDで曖昧さを減らす）
  - Decision log（任意）

## INDEX（入口）
- nfr/INDEX.md を唯一の目次として運用する
- Idea/Ready/In progress/Done/Abandoned のセクションを持つ
- 追加・昇格・完了時は必ずINDEXも更新する

## エージェントへの依頼ルール
- 実装依頼の前に、対象NFR（nfr.md）を必ず参照させる
- 依頼文には「読むべきファイル」を明記する
  - 例: `nfr/001_api_response_time/nfr.md`
- NFRに書いてない仕様は「未決」とみなす（勝手に補完しない）
