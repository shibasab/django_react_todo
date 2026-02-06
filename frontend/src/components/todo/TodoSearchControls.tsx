import { useState, type ChangeEvent } from 'react'

import { SelectBox, type SelectOption } from '../SelectBox'

type StatusFilter = 'all' | 'completed' | 'incomplete'
type DueDateFilter = 'all' | 'today' | 'this_week' | 'overdue' | 'none'

type TodoSearchState = Readonly<{
  keyword: string
  status: StatusFilter
  dueDate: DueDateFilter
}>

const DEFAULT_SEARCH_STATE: TodoSearchState = {
  keyword: '',
  status: 'all',
  dueDate: 'all',
}

const STATUS_OPTIONS: readonly SelectOption<StatusFilter>[] = [
  { value: 'all', label: 'すべて' },
  { value: 'completed', label: '完了' },
  { value: 'incomplete', label: '未完了' },
]

const DUE_DATE_OPTIONS: readonly SelectOption<DueDateFilter>[] = [
  { value: 'all', label: 'すべて' },
  { value: 'today', label: '今日' },
  { value: 'this_week', label: '今週' },
  { value: 'overdue', label: '期限切れ' },
  { value: 'none', label: '期限なし' },
]

export const TodoSearchControls = () => {
  const [state, setState] = useState<TodoSearchState>(DEFAULT_SEARCH_STATE)

  const handleKeywordChange = (event: ChangeEvent<HTMLInputElement>) => {
    setState((prev) => ({ ...prev, keyword: event.target.value }))
  }

  const handleStatusChange = (status: StatusFilter) => {
    setState((prev) => ({ ...prev, status }))
  }

  const handleDueDateChange = (dueDate: DueDateFilter) => {
    setState((prev) => ({ ...prev, dueDate }))
  }

  const handleClear = () => {
    setState(DEFAULT_SEARCH_STATE)
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
            value={state.keyword}
            onChange={handleKeywordChange}
            placeholder="タスク名・詳細で検索"
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <SelectBox
          id="todo-search-status"
          label="状態"
          value={state.status}
          onChange={handleStatusChange}
          options={STATUS_OPTIONS}
          wrapperClassName="w-full md:w-48"
        />
        <SelectBox
          id="todo-search-due-date"
          label="期限"
          value={state.dueDate}
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
