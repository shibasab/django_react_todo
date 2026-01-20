---
Title: タスク完了ステータス
Status: Ready
Created: 2026-01-20
Last updated: 2026-01-20
Source: ../000_backlog/task-completion-status.md
---

# タスク完了ステータス (Task Completion Status)

## 1. Goal
タスクの完了/未完了を管理できるようにし、進捗状況を視覚的に把握できるようにする。

## 2. Non-goals
- 完了日時の記録・表示。
- 進捗率（パーセンテージ）の計算・表示。
- サブタスクの完了状態管理。
- 完了タスクの自動アーカイブや並び替え（完了を下に並べる等）。
- 一括完了/一括未完了の操作。

## 3. User Scenarios & Testing

### シナリオ1: タスクを完了としてマークする
- **Given**: An incomplete task is visible in the list.
- **When**: The user clicks the completion toggle (checkbox) on the task.
- **Then**: The task is saved as completed and is visually distinguished (e.g., strikethrough or muted color). The state persists after a reload.

### シナリオ2: 完了タスクを未完了に戻す
- **Given**: A completed task is visible in the list.
- **When**: The user turns the completion toggle off.
- **Then**: The task is saved as incomplete and returns to the normal display.

### シナリオ3: 完了/未完了のフィルタリング
- **Given**: The list contains both completed and incomplete tasks.
- **When**: The user switches the filter to "Incomplete" or "Completed".
- **Then**: Only tasks matching the selected status are shown. Switching back to "All" shows every task.

### シナリオ4: フィルタ中のステータス切り替え
- **Given**: The filter is set to "Incomplete".
- **When**: The user marks a visible task as completed.
- **Then**: The task disappears from the list because it no longer matches the filter.

## 4. Edge Cases
- **更新失敗**: 完了ステータスの更新に失敗した場合は、トグルを元に戻し、ユーザーに失敗を通知する。
- **連続トグル**: 同一タスクで短時間に連続して切り替えた場合、最後の操作結果が保存される（必要に応じて送信中はトグルを無効化する）。
- **編集と完了状態の共存**: タスク名/詳細を編集しても完了状態は維持される。完了状態の変更は編集とは独立して行える。
- **フィルタ結果が空**: フィルタの結果0件の場合は空状態メッセージを表示する。
- **権限エラー**: 他ユーザーのタスクに対して完了状態を変更しようとした場合は拒否される（既存の認可ルールに準拠）。

## 5. Requirements

### Functional Requirements
- **FR-001**: Taskモデルに `is_completed` (boolean, default=false, NOT NULL) を追加する (MUST)。
- **FR-002**: APIレスポンスのTodo表現に `isCompleted` を含める (MUST)。
- **FR-003**: `POST /todo/` は `isCompleted` を省略可能とし、省略時は `false` とする (MUST)。
- **FR-004**: `PUT /todo/{id}/` は `isCompleted` を受け取り、完了状態を更新できる (MUST)。
- **FR-005**: フロントエンドのTodoモデルに `isCompleted` を追加する (MUST)。
- **FR-006**: タスク一覧に完了トグル（チェックボックス/スイッチ）を表示し、ワンクリックで完了/未完了を切り替えられる (MUST)。
- **FR-007**: 完了タスクは一覧上で視覚的に区別される（例: 取り消し線・淡色・バッジ） (MUST)。
- **FR-008**: 「すべて/未完了/完了」のフィルタUIを提供する (MUST)。フィルタはフロントエンド側で適用する。
- **FR-009**: フィルタ中に状態が変わったタスクは、該当しなくなった場合に一覧から消える (MUST)。

### Non-functional Requirements
- **NFR-001**: 完了トグル操作の結果は1秒以内に反映されるか、反映待ち状態が明確に分かる (SHOULD)。
- **NFR-002**: 完了状態の視覚表現は可読性を損なわない (MUST)。

## 6. Open Questions
- なし
