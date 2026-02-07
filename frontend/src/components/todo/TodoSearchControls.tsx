import type { ChangeEvent } from 'react'

import { SelectBox, type SelectOption } from '../SelectBox'
import type { TodoDueDateFilter, TodoStatusFilter } from '../../models/todo'
import { DEFAULT_TODO_SEARCH_STATE, type TodoSearchState } from '../../hooks/todoSearch'

const STATUS_OPTIONS: readonly SelectOption<TodoStatusFilter>[] = [
  { value: 'all', label: 'すべて' },
  { value: 'completed', label: '完了' },
  { value: 'incomplete', label: '未完了' },
]

const DUE_DATE_OPTIONS: readonly SelectOption<TodoDueDateFilter>[] = [
  { value: 'all', label: 'すべて' },
  { value: 'today', label: '今日' },
  { value: 'this_week', label: '今週' },
  { value: 'overdue', label: '期限切れ' },
  { value: 'none', label: '期限なし' },
]

type TodoSearchControlsProps = Readonly<{
  value: TodoSearchState
  onChange: (next: TodoSearchState) => void
}>

export const TodoSearchControls = ({ value, onChange }: TodoSearchControlsProps) => {
  const handleKeywordChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange({ ...value, keyword: event.target.value })
  }

  const handleStatusChange = (status: TodoStatusFilter) => {
    onChange({ ...value, status })
  }

  const handleDueDateChange = (dueDate: TodoDueDateFilter) => {
    onChange({ ...value, dueDate })
  }

  const handleClear = () => {
    onChange(DEFAULT_TODO_SEARCH_STATE)
  }

  return (
    <section className="mb-6 rounded-lg border border-gray-100 bg-white p-4 shadow-md">
      <h4 className="mb-3 text-lg font-bold">検索・フィルタ</h4>
      <div className="flex flex-col gap-4 md:flex-row md:items-end">
        <div className="flex-1">
          <label htmlFor="todo-search-keyword" className="mb-1 block text-sm font-medium text-gray-700">
            検索
          </label>
          <input
            id="todo-search-keyword"
            type="text"
            value={value.keyword}
            onChange={handleKeywordChange}
            placeholder="タスク名・詳細で検索"
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <SelectBox
          id="todo-search-status"
          label="状態"
          value={value.status}
          onChange={handleStatusChange}
          options={STATUS_OPTIONS}
          wrapperClassName="w-full md:w-48"
        />
        <SelectBox
          id="todo-search-due-date"
          label="期限"
          value={value.dueDate}
          onChange={handleDueDateChange}
          options={DUE_DATE_OPTIONS}
          wrapperClassName="w-full md:w-48"
        />
        <div className="flex w-full md:w-auto">
          <button
            type="button"
            onClick={handleClear}
            className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            クリア
          </button>
        </div>
      </div>
    </section>
  )
}
