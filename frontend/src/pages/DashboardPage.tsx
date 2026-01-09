import { Fragment, useEffect } from 'react'

import { TodoForm } from '../components/todo/TodoForm'
import { TodoList } from '../components/todo/TodoList'
import { useTodo } from '../hooks/useTodo'

// TODO: Phase 4でlayouts/PrivateLayout.tsxにLoading表示と認証チェックを移動する

export const DashboardPage = () => {
  const { todos, isLoading, fetchTodos, addTodo, removeTodo } = useTodo()

  useEffect(() => {
    fetchTodos()
  }, [])

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <Fragment>
      <TodoList todos={todos} onDelete={removeTodo} />
      <TodoForm onSubmit={addTodo} />
    </Fragment>
  )
}
