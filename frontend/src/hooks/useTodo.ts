import { useCallback, useState } from 'react'

import type { ValidationError, ValidationErrorResponse } from '../models/error'
import type { Todo } from '../models/todo'

import { useApiClient } from '../contexts/ApiContext'
import { validateRequired, validateMaxLength } from '../services/validation'

// バリデーション制約値（バックエンドと同期）
export const TODO_NAME_MAX_LENGTH = 100
export const TODO_DETAIL_MAX_LENGTH = 500

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
  addTodo: (name: string, detail: string, dueDate: string | null) => Promise<readonly ValidationError[] | undefined>
  updateTodo: (
    id: number,
    name: string,
    detail: string,
    dueDate: string | null,
    isCompleted: boolean,
  ) => Promise<readonly ValidationError[] | undefined>
  toggleTodoCompletion: (todo: Todo) => Promise<void>
  removeTodo: (id: number) => Promise<void>
  validateTodo: (name: string, detail: string) => readonly ValidationError[]
}>

export const useTodo = (): TodoService => {
  const { apiClient, isLoading } = useApiClient()
  const [todos, setTodos] = useState<readonly Todo[]>([])

  const fetchTodos = useCallback(async () => {
    const data = await apiClient.get('/todo/')
    setTodos(data)
  }, [apiClient])

  const addTodo = useCallback(
    async (name: string, detail: string, dueDate: string | null): Promise<readonly ValidationError[] | undefined> => {
      // クライアントバリデーション
      const clientErrors = validateTodoForm(name, detail)
      if (clientErrors.length > 0) {
        return clientErrors
      }

      // API 呼び出し（unique_violation 等はサーバーでのみ検出）
      const result = await apiClient.post('/todo/', { name, detail, dueDate })
      if (!result.ok) {
        return result.error.errors
      }
      await fetchTodos()
    },
    [apiClient, fetchTodos],
  )

  const updateTodo = useCallback(
    async (
      id: number,
      name: string,
      detail: string,
      dueDate: string | null,
      isCompleted: boolean,
    ): Promise<readonly ValidationError[] | undefined> => {
      // クライアントバリデーション
      const clientErrors = validateTodoForm(name, detail)
      if (clientErrors.length > 0) {
        return clientErrors
      }

      // API 呼び出し（unique_violation 等はサーバーでのみ検出）
      const result = await apiClient.put<Todo, ValidationErrorResponse>(`/todo/${id}/`, {
        name,
        detail,
        dueDate,
        isCompleted,
      })
      if (!result.ok) {
        return result.error.errors
      }
      await fetchTodos()
    },
    [apiClient, fetchTodos],
  )

  const toggleTodoCompletion = useCallback(
    async (todo: Todo) => {
      // 現在の状態を反転させて更新
      await updateTodo(todo.id, todo.name, todo.detail, todo.dueDate, !todo.isCompleted)
    },
    [updateTodo],
  )

  const removeTodo = useCallback(
    async (id: number) => {
      await apiClient.delete(`/todo/${id}/`)
      await fetchTodos()
    },
    [apiClient, fetchTodos],
  )

  return {
    todos,
    isLoading,
    fetchTodos,
    addTodo,
    updateTodo,
    toggleTodoCompletion,
    removeTodo,
    validateTodo: validateTodoForm,
  } as const
}
