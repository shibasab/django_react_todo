import { Fragment, useCallback, useEffect, useState } from 'react'
import { useDebounce } from 'use-debounce'

import { TodoForm } from '../components/todo/TodoForm'
import { TodoList } from '../components/todo/TodoList'
import { TodoQuickAdd } from '../components/todo/TodoQuickAdd'
import { TodoSearchControls } from '../components/todo/TodoSearchControls'
import { DEFAULT_TODO_SEARCH_STATE, hasSearchCriteria, type TodoSearchState } from '../hooks/todoSearch'
import { useTodo } from '../hooks/useTodo'

export const DashboardPage = () => {
  const { todos, isLoading, fetchTodos, addTodo, updateTodo, removeTodo, toggleTodoCompletion } = useTodo()
  const [searchState, setSearchState] = useState<TodoSearchState>(DEFAULT_TODO_SEARCH_STATE)
  const [isDetailFormOpen, setIsDetailFormOpen] = useState(false)
  const [debouncedSearchState] = useDebounce(searchState, 300)
  const searchHasCriteria = hasSearchCriteria(searchState)

  // 仕様(FR-007): 検索・フィルタの変更は即時に反映する（入力中はデバウンス）
  useEffect(() => {
    // TODO: Promiseが浮いているため、適切なエラーハンドリングまたはvoid演算子の使用を検討する
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    fetchTodos(debouncedSearchState)
  }, [fetchTodos, debouncedSearchState])

  const handleSearchChange = useCallback((next: TodoSearchState) => {
    setSearchState(next)
  }, [])

  const handleDetailFormToggle = useCallback(() => {
    setIsDetailFormOpen((prev) => !prev)
  }, [])

  // 初回ロード時のみローディング表示（todos が取得済みの場合は表示しない）
  if (isLoading && todos.length === 0) {
    return <div className="flex items-center justify-center min-h-50 text-gray-600">Loading todos...</div>
  }

  return (
    <Fragment>
      <TodoSearchControls value={searchState} onChange={handleSearchChange} />
      <TodoQuickAdd onSubmit={addTodo} />
      <section className="mb-6 rounded-lg border border-gray-100 bg-white p-4 shadow-md">
        <button
          type="button"
          onClick={handleDetailFormToggle}
          aria-expanded={isDetailFormOpen}
          aria-controls="todo-detail-form-panel"
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
        >
          {isDetailFormOpen ? '詳細入力を閉じる' : '詳細入力を開く'}
        </button>
        {isDetailFormOpen ? (
          <div id="todo-detail-form-panel">
            <TodoForm onSubmit={addTodo} />
          </div>
        ) : null}
      </section>
      <TodoList
        todos={todos}
        hasSearchCriteria={searchHasCriteria}
        onDelete={removeTodo}
        onEdit={updateTodo}
        onToggleCompletion={toggleTodoCompletion}
      />
    </Fragment>
  )
}
