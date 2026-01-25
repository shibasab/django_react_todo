import { useCallback, useState } from 'react'

import type { ValidationError, ValidationErrorResponse } from '../models/error'
import type { CreateTodoRequest, Todo } from '../models/todo'

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
  addTodo: (todo: Omit<Todo, 'id'>) => Promise<readonly ValidationError[] | undefined>
  updateTodo: (todo: Todo) => Promise<readonly ValidationError[] | undefined>
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
    async (data: CreateTodoRequest): Promise<readonly ValidationError[] | undefined> => {
      // クライアントバリデーション
      const clientErrors = validateTodoForm(data.name, data.detail)
      if (clientErrors.length > 0) {
        return clientErrors
      }

      // API 呼び出し（unique_violation 等はサーバーでのみ検出）
      const result = await apiClient.post('/todo/', {
        ...data,
      })
      if (!result.ok) {
        return result.error.errors
      }
      await fetchTodos()
    },
    [apiClient, fetchTodos],
  )

  const updateTodo = useCallback(
    async (todo: Todo): Promise<readonly ValidationError[] | undefined> => {
      // クライアントバリデーション
      const clientErrors = validateTodoForm(todo.name, todo.detail)
      if (clientErrors.length > 0) {
        return clientErrors
      }

      const { id, ...body } = todo
      // API 呼び出し（unique_violation 等はサーバーでのみ検出）
      const result = await apiClient.put<Todo, ValidationErrorResponse>(`/todo/${id}/`, {
        ...body,
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
      const validationErrors = await updateTodo({
        ...todo,
        isCompleted: !todo.isCompleted,
      })
      if (validationErrors) {
        // TODO: エラー対応（toast表示など）を行う
        return
      }
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
