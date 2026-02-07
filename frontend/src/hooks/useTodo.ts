import { useCallback, useRef, useState } from 'react'

import type { ValidationError, ValidationErrorResponse } from '../models/error'
import type { CreateTodoRequest, Todo } from '../models/todo'

import { useApiClient } from '../contexts/ApiContext'
import type { TodoSearchParams, TodoSearchState } from './todoSearch'
import { validateRequired, validateMaxLength } from '../services/validation'

// バリデーション制約値（バックエンドと同期）
export const TODO_NAME_MAX_LENGTH = 100
export const TODO_DETAIL_MAX_LENGTH = 500

const removeNulls = <T>(values: readonly (T | null)[]): readonly T[] => {
  return values.filter((value) => value != null)
}

const getTodoNameErrors = (value: string): readonly ValidationError[] => {
  return removeNulls([validateRequired('name', value), validateMaxLength('name', value, TODO_NAME_MAX_LENGTH)])
}

const getTodoDetailErrors = (value: string): readonly ValidationError[] => {
  return removeNulls([validateMaxLength('detail', value, TODO_DETAIL_MAX_LENGTH)])
}

/**
 * Todoフォームのバリデーション
 * @returns バリデーションエラーの配列（エラーがなければ空配列）
 */
const validateTodoForm = (name: string, detail: string): readonly ValidationError[] => {
  return [...getTodoNameErrors(name), ...getTodoDetailErrors(detail)]
}

type ErrorsUpdater = (update: (prev: readonly ValidationError[]) => readonly ValidationError[]) => void

export const useTodoFieldValidation = (setErrors: ErrorsUpdater) => {
  const updateFieldErrors = useCallback(
    (fieldName: string, newErrors: readonly ValidationError[]) => {
      setErrors((prev) => {
        const remaining = prev.filter((error) => error.field !== fieldName)
        return newErrors.length > 0 ? [...remaining, ...newErrors] : remaining
      })
    },
    [setErrors],
  )

  const validateName = useCallback(
    (value: string) => {
      updateFieldErrors('name', getTodoNameErrors(value))
    },
    [updateFieldErrors],
  )

  const validateDetail = useCallback(
    (value: string) => {
      updateFieldErrors('detail', getTodoDetailErrors(value))
    },
    [updateFieldErrors],
  )

  return { validateName, validateDetail, updateFieldErrors } as const
}

type TodoService = Readonly<{
  todos: readonly Todo[]
  isLoading: boolean
  fetchTodos: (criteria?: TodoSearchState) => Promise<void>
  addTodo: (todo: Omit<Todo, 'id'>) => Promise<readonly ValidationError[] | undefined>
  updateTodo: (todo: Todo) => Promise<readonly ValidationError[] | undefined>
  toggleTodoCompletion: (todo: Todo) => Promise<void>
  removeTodo: (id: number) => Promise<void>
  validateTodo: (name: string, detail: string) => readonly ValidationError[]
}>

const buildTodoSearchParams = (criteria?: TodoSearchState): TodoSearchParams | undefined => {
  if (!criteria) {
    return undefined
  }

  const keyword = criteria.keyword.trim()
  const status = criteria.status === 'all' ? undefined : criteria.status
  const due_date = criteria.dueDate === 'all' ? undefined : criteria.dueDate

  const params: TodoSearchParams = {
    ...(keyword === '' ? {} : { keyword }),
    ...(status ? { status } : {}),
    ...(due_date ? { due_date } : {}),
  }

  return Object.keys(params).length > 0 ? params : undefined
}

export const useTodo = (): TodoService => {
  const { apiClient, isLoading } = useApiClient()
  const [todos, setTodos] = useState<readonly Todo[]>([])
  // 検索条件を保持し、追加/更新/削除後も同じ条件で再取得するために使用する
  const lastSearchRef = useRef<TodoSearchState | undefined>(undefined)
  const requestIdRef = useRef(0)

  const fetchTodos = useCallback(async (criteria?: TodoSearchState) => {
    const requestId = requestIdRef.current + 1
    requestIdRef.current = requestId
    lastSearchRef.current = criteria
    const params = buildTodoSearchParams(criteria)
    const data = await apiClient.get('/todo/', params ? { params } : undefined)
    if (requestIdRef.current !== requestId) {
      return
    }
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
      await fetchTodos(lastSearchRef.current)
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
      await fetchTodos(lastSearchRef.current)
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
      await fetchTodos(lastSearchRef.current)
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
