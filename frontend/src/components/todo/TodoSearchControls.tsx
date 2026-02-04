import { useState, type ChangeEvent } from 'react'

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

export const TodoSearchControls = () => {
  const [state, setState] = useState<TodoSearchState>(DEFAULT_SEARCH_STATE)

  const handleKeywordChange = (event: ChangeEvent<HTMLInputElement>) => {
    setState((prev) => ({ ...prev, keyword: event.target.value }))
  }

  const handleStatusChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const status = event.target.value
    if (status === 'all' || status === 'completed' || status === 'incomplete') {
      setState((prev) => ({ ...prev, status }))
    }
  }

  const handleDueDateChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const dueDate = event.target.value
    if (
      dueDate === 'all' ||
      dueDate === 'today' ||
      dueDate === 'this_week' ||
      dueDate === 'overdue' ||
      dueDate === 'none'
    ) {
      setState((prev) => ({ ...prev, dueDate }))
    }
  }

  const handleClear = () => {
    setState(DEFAULT_SEARCH_STATE)
  }

  return (
    <section className="mb-6 rounded-lg border border-gray-100 bg-white p-4 shadow-md">
      <h4 className="text-lg font-bold mb-3">検索・フィルタ</h4>
      <div className="flex flex-col gap-4 md:flex-row md:items-end">
        <div className="flex-1">
          <label htmlFor="todo-search-keyword" className="block text-sm font-medium text-gray-700 mb-1">
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
        <div className="w-full md:w-48">
          <label htmlFor="todo-search-status" className="block text-sm font-medium text-gray-700 mb-1">
            状態
          </label>
          <select
            id="todo-search-status"
            value={state.status}
            onChange={handleStatusChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">すべて</option>
            <option value="completed">完了</option>
            <option value="incomplete">未完了</option>
          </select>
        </div>
        <div className="w-full md:w-48">
          <label htmlFor="todo-search-due-date" className="block text-sm font-medium text-gray-700 mb-1">
            期限
          </label>
          <select
            id="todo-search-due-date"
            value={state.dueDate}
            onChange={handleDueDateChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">すべて</option>
            <option value="today">今日</option>
            <option value="this_week">今週</option>
            <option value="overdue">期限切れ</option>
            <option value="none">期限なし</option>
          </select>
        </div>
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
