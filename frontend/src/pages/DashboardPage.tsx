import { Fragment, useEffect } from 'react'

import { TodoForm } from '../components/todo/TodoForm'
import { TodoList } from '../components/todo/TodoList'
import { TodoSearchControls } from '../components/todo/TodoSearchControls'
import { useTodo } from '../hooks/useTodo'

export const DashboardPage = () => {
  const { todos, isLoading, fetchTodos, addTodo, updateTodo, removeTodo, toggleTodoCompletion } = useTodo()

  useEffect(() => {
    // TODO: Promiseが浮いているため、適切なエラーハンドリングまたはvoid演算子の使用を検討する
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    fetchTodos()
  }, [fetchTodos])

  // 初回ロード時のみローディング表示（todos が取得済みの場合は表示しない）
  if (isLoading && todos.length === 0) {
    return <div className="flex items-center justify-center min-h-50 text-gray-600">Loading todos...</div>
  }

  return (
    <Fragment>
      <TodoSearchControls />
      <TodoList todos={todos} onDelete={removeTodo} onEdit={updateTodo} onToggleCompletion={toggleTodoCompletion} />
      <TodoForm onSubmit={addTodo} />
    </Fragment>
  )
}
