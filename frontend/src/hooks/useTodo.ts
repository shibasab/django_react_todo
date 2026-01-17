import { useState } from 'react'

import type { Todo } from '../models/todo'

import { useApiClient } from '../contexts/ApiContext'

type TodoService = Readonly<{
  todos: readonly Todo[]
  isLoading: boolean
  fetchTodos: () => Promise<void>
  addTodo: (name: string, detail: string) => Promise<void>
  updateTodo: (id: number, name: string, detail: string) => Promise<void>
  removeTodo: (id: number) => Promise<void>
}>

export const useTodo = (): TodoService => {
  const { apiClient, isLoading } = useApiClient()
  const [todos, setTodos] = useState<readonly Todo[]>([])

  const fetchTodos = async () => {
    const data = await apiClient.get('/todo/')
    setTodos(data)
  }

  const addTodo = async (name: string, detail: string) => {
    await apiClient.post('/todo/', { name, detail })
    fetchTodos()
  }

  const updateTodo = async (id: number, name: string, detail: string) => {
    await apiClient.put<Todo>(`/todo/${id}/`, { name, detail })
    fetchTodos()
  }

  const removeTodo = async (id: number) => {
    await apiClient.delete(`/todo/${id}/`)
    fetchTodos()
  }

  return {
    todos,
    isLoading,
    fetchTodos,
    addTodo,
    updateTodo,
    removeTodo,
  } as const
}
