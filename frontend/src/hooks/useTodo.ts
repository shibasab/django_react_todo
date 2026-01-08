import { useState } from 'react'

import type { Todo } from '../models/todo'

import { apiClient } from '../services/api'

const fetchTodosApi = () => apiClient.get<readonly Todo[]>('/todo/')
const createTodoApi = (name: string, detail: string) => apiClient.post<Todo>('/todo/', { name, detail })
const deleteTodoApi = (id: number) => apiClient.delete(`/todo/${id}/`)

type TodoService = Readonly<{
  todos: readonly Todo[]
  isLoading: boolean
  fetchTodos: () => Promise<void>
  addTodo: (name: string, detail: string) => Promise<void>
  removeTodo: (id: number) => Promise<void>
}>

export const useTodo = (): TodoService => {
  const [todos, setTodos] = useState<readonly Todo[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchTodos = async () => {
    setIsLoading(true)
    try {
      const data = await fetchTodosApi()
      setTodos(data)
    } finally {
      setIsLoading(false)
    }
  }

  const addTodo = async (name: string, detail: string) => {
    await createTodoApi(name, detail)
    fetchTodos()
  }

  const removeTodo = async (id: number) => {
    await deleteTodoApi(id)
    fetchTodos()
  }

  return {
    todos,
    isLoading,
    fetchTodos,
    addTodo,
    removeTodo,
  } as const
}
