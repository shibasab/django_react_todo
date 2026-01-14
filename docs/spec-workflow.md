# 機能管理の運用ルール

このリポジトリでは、実装前に「要件・仕様（WHAT/WHY）」をMarkdownで管理する。
※実装計画（HOW）や影響範囲の詳細などは実装着手前に作成するため、Markdownには記載しない。

## 目的
- エージェントに渡すブレない要求を残す
- 実装と仕様の同期をGitで追えるようにする

## ディレクトリ構成
- specs/000_backlog/: アイデア（軽量Spec）
- specs/NNN_feature/: 着手する機能のSpec（Ready以上）

## Specの状態（Status）
- Idea: アイデア段階（000_backlog配下）
- Ready: 着手OK（受け入れ条件が揃っている）
- In progress: 実装中
- Done: 完了（原則凍結）
- Abandoned: 中止（理由だけ残す）

## ファイル規約
### 1) アイデア（軽量Spec）
- path: specs/000_backlog/\<slug>\.md
- 必須: Goal / User story / Non-goals / Acceptance criteria（粗くてOK）

### 2) 着手Spec（要件・仕様のみ）
- path: specs/\<NNN>_\<feature>/spec.md
- 必須:
  - Goal（1〜2文）
  - Non-goals
  - User Scenarios & Testing（Given/When/Then）
  - Edge Cases
  - Requirements（FR-001形式、MUST/SHOULDで曖昧さを減らす）
  - Open Questions（任意）

## INDEX（入口）
- specs/INDEX.md を唯一の目次として運用する
- Idea/Ready/In progress/Done/Abandoned のセクションを持つ
- 追加・昇格・完了時は必ずINDEXも更新する

## エージェントへの依頼ルール
- 実装依頼の前に、対象Spec（spec.md）を必ず参照させる
- 依頼文には「読むべきファイル」を明記する
  - 例: `specs/012_csv_export/spec.md` と（存在すれば）`.specify/memory/constitution.md`
- Specに書いてない仕様は「未決」とみなす（勝手に補完しない）
