import { Fragment, useEffect } from 'react'

import { TodoForm } from '../components/todo/TodoForm'
import { TodoList } from '../components/todo/TodoList'
import { useTodo } from '../hooks/useTodo'

export const DashboardPage = () => {
  const { todos, isLoading, fetchTodos, addTodo, removeTodo } = useTodo()

  useEffect(() => {
    fetchTodos()
  }, [])

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[200px] text-gray-600">Loading todos...</div>
  }

  return (
    <Fragment>
      <TodoList todos={todos} onDelete={removeTodo} />
      <TodoForm onSubmit={addTodo} />
    </Fragment>
  )
}
