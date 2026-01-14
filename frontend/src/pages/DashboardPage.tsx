import { Fragment, useEffect } from 'react'

import { TodoForm } from '../components/todo/TodoForm'
import { TodoList } from '../components/todo/TodoList'
import { useTodo } from '../hooks/useTodo'

export const DashboardPage = () => {
  const { todos, isLoading, fetchTodos, addTodo, updateTodo, removeTodo } = useTodo()

  useEffect(() => {
    fetchTodos()
  }, [])

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-50 text-gray-600">Loading todos...</div>
  }

  return (
    <Fragment>
      <TodoList todos={todos} onDelete={removeTodo} onEdit={updateTodo} />
      <TodoForm onSubmit={addTodo} />
    </Fragment>
  )
}
