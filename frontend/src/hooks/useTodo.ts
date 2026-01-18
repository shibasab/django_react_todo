import { useState } from 'react'

import type { ValidationError, ValidationErrorResponse } from '../models/error'
import type { Todo } from '../models/todo'

import { useApiClient } from '../contexts/ApiContext'
import { validateRequired, validateMaxLength } from '../services/validation'

// バリデーション制約値（バックエンドと同期）
const TODO_NAME_MAX_LENGTH = 100
const TODO_DETAIL_MAX_LENGTH = 500

/**
 * Todoフォームのバリデーション
 * @returns バリデーションエラーの配列（エラーがなければ空配列）
 */
const validateTodoForm = (name: string, detail: string): readonly ValidationError[] => {
  return [
    validateRequired('name', name),
    validateMaxLength('name', name, TODO_NAME_MAX_LENGTH),
    validateMaxLength('detail', detail, TODO_DETAIL_MAX_LENGTH),
  ].filter((e) => e != null)
}

type TodoService = Readonly<{
  todos: readonly Todo[]
  isLoading: boolean
  fetchTodos: () => Promise<void>
  addTodo: (name: string, detail: string) => Promise<readonly ValidationError[] | undefined>
  updateTodo: (id: number, name: string, detail: string) => Promise<readonly ValidationError[] | undefined>
  removeTodo: (id: number) => Promise<void>
  validateTodo: (name: string, detail: string) => readonly ValidationError[]
}>

export const useTodo = (): TodoService => {
  const { apiClient, isLoading } = useApiClient()
  const [todos, setTodos] = useState<readonly Todo[]>([])

  const fetchTodos = async () => {
    const data = await apiClient.get('/todo/')
    setTodos(data)
  }

  const addTodo = async (name: string, detail: string): Promise<readonly ValidationError[] | undefined> => {
    // クライアントバリデーション
    const clientErrors = validateTodoForm(name, detail)
    if (clientErrors.length > 0) {
      return clientErrors
    }

    // API 呼び出し（unique_violation 等はサーバーでのみ検出）
    const result = await apiClient.post('/todo/', { name, detail })
    if (!result.ok) {
      return result.error.errors
    }
    fetchTodos()
  }

  const updateTodo = async (
    id: number,
    name: string,
    detail: string,
  ): Promise<readonly ValidationError[] | undefined> => {
    // クライアントバリデーション
    const clientErrors = validateTodoForm(name, detail)
    if (clientErrors.length > 0) {
      return clientErrors
    }

    // API 呼び出し（unique_violation 等はサーバーでのみ検出）
    const result = await apiClient.put<Todo, ValidationErrorResponse>(`/todo/${id}/`, { name, detail })
    if (!result.ok) {
      return result.error.errors
    }
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
    validateTodo: validateTodoForm,
  } as const
}
