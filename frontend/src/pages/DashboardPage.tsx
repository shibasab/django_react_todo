import { Fragment, useCallback, useEffect, useState } from 'react'
import { useDebounce } from 'use-debounce'

import { TodoForm } from '../components/todo/TodoForm'
import { TodoList } from '../components/todo/TodoList'
import { TodoSearchControls } from '../components/todo/TodoSearchControls'
import { useTodo } from '../hooks/useTodo'
import { DEFAULT_TODO_SEARCH_STATE, type TodoSearchState } from '../hooks/todoSearch'

export const DashboardPage = () => {
  const { todos, isLoading, fetchTodos, addTodo, updateTodo, removeTodo, toggleTodoCompletion } = useTodo()
  const [searchState, setSearchState] = useState<TodoSearchState>(DEFAULT_TODO_SEARCH_STATE)
  const [debouncedSearchState] = useDebounce(searchState, 300)

  // 仕様(FR-007): 検索・フィルタの変更は即時に反映する（入力中はデバウンス）
  useEffect(() => {
    // TODO: Promiseが浮いているため、適切なエラーハンドリングまたはvoid演算子の使用を検討する
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    fetchTodos(debouncedSearchState)
  }, [fetchTodos, debouncedSearchState])

  const handleSearchChange = useCallback((next: TodoSearchState) => {
    setSearchState(next)
  }, [])

  // 初回ロード時のみローディング表示（todos が取得済みの場合は表示しない）
  if (isLoading && todos.length === 0) {
    return <div className="flex items-center justify-center min-h-50 text-gray-600">Loading todos...</div>
  }

  return (
    <Fragment>
      <TodoSearchControls value={searchState} onChange={handleSearchChange} />
      <TodoList todos={todos} onDelete={removeTodo} onEdit={updateTodo} onToggleCompletion={toggleTodoCompletion} />
      <TodoForm onSubmit={addTodo} />
    </Fragment>
  )
}
