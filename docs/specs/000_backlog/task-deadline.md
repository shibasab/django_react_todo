---
Title: 期限設定
Status: Idea
Created: 2026-01-14
Last updated: 2026-01-14
---

# 期限設定 (Deadline)

## Goal
タスクに締切を設定可能にし、計画的なタスク消化を支援する。

## User story
- ユーザーはタスク作成時または編集時に、締切日を設定できる。
- ユーザーはタスク一覧で、締切日が近いタスクを確認できる（ソートや強調表示など）。

## Non-goals
- 実行予定日 (Schedule) の設定
- Google Calendar連携
- リマインダー通知

## Acceptance criteria
- [ ] タスクモデルに `due_date` (締切) カラムが追加されていること。
- [ ] フロントエンドで締切日を選択できること。
- [ ] タスク一覧で締切日が表示されること。

## Notes
- 日付入力UIはブラウザ標準の date picker を使用する想定。

## Open Questions
- 時間指定まで必要か？今回は日付のみとするか？ -> MVPでは日付のみとする。
