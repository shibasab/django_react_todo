import type { ApiError } from '@todoapp/shared'
import { todoPath } from '@todoapp/shared'
import { ref } from 'vue'

import { toValidationErrors, type ValidationError } from '../models/error'
import type { CreateTodoInput, Todo, TodoRecurrenceType } from '../models/todo'
import { toCreateTodoRequest, toTodoViewModels, toUpdateTodoRequest } from '../services/todoApi'
import { validateRequired, validateMaxLength } from '../services/validation'
import { useApiStore } from '../stores/api'
import type { TodoSearchParams, TodoSearchState } from './todoSearch'

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

const getTodoDueDateErrors = (
  dueDate: string | null | undefined,
  recurrenceType: TodoRecurrenceType,
): readonly ValidationError[] => {
  if (recurrenceType === 'none' || dueDate != null) {
    return []
  }
  return [{ field: 'dueDate', reason: 'required' }]
}

const validateTodoForm = (
  name: string,
  detail: string,
  dueDate: string | null | undefined,
  recurrenceType: TodoRecurrenceType,
): readonly ValidationError[] => {
  return [...getTodoNameErrors(name), ...getTodoDetailErrors(detail), ...getTodoDueDateErrors(dueDate, recurrenceType)]
}

type ErrorsUpdater = (update: (prev: readonly ValidationError[]) => readonly ValidationError[]) => void

export const useTodoFieldValidation = (setErrors: ErrorsUpdater) => {
  const updateFieldErrors = (fieldName: string, newErrors: readonly ValidationError[]) => {
    setErrors((prev) => {
      const remaining = prev.filter((error) => error.field !== fieldName)
      return newErrors.length > 0 ? [...remaining, ...newErrors] : remaining
    })
  }

  const validateName = (value: string) => {
    updateFieldErrors('name', getTodoNameErrors(value))
  }

  const validateDetail = (value: string) => {
    updateFieldErrors('detail', getTodoDetailErrors(value))
  }

  return { validateName, validateDetail, updateFieldErrors } as const
}

type TodoMutationApiError = ApiError<'post', '/todo/'>

const toTodoMutationErrors = (error: TodoMutationApiError): readonly ValidationError[] => {
  if (error.status === 409) {
    return [{ field: 'global', reason: error.detail }]
  }
  return toValidationErrors(error.errors)
}

const buildTodoSearchParams = (criteria?: TodoSearchState): TodoSearchParams | undefined => {
  if (!criteria) {
    return undefined
  }

  const keyword = criteria.keyword.trim()
  const progressStatus = criteria.status === 'all' ? undefined : criteria.status
  const dueDate = criteria.dueDate === 'all' ? undefined : criteria.dueDate

  const params: TodoSearchParams = {
    ...(keyword === '' ? {} : { keyword }),
    ...(progressStatus ? { progressStatus } : {}),
    ...(dueDate ? { dueDate } : {}),
  }

  return Object.keys(params).length > 0 ? params : undefined
}

export const useTodo = () => {
  const { apiClient, isLoading } = useApiStore()
  const todos = ref<readonly Todo[]>([])
  let lastSearch: TodoSearchState | undefined

  const fetchTodos = async (criteria?: TodoSearchState) => {
    lastSearch = criteria
    const params = buildTodoSearchParams(criteria)
    const data = await apiClient.get('/todo/', {
      ...(params ? { params } : {}),
      options: {
        key: 'todo-search',
        mode: 'latestOnly',
      },
    })
    todos.value = toTodoViewModels(data)
  }

  const addTodo = async (data: CreateTodoInput): Promise<readonly ValidationError[] | undefined> => {
    const clientErrors = validateTodoForm(data.name, data.detail, data.dueDate, data.recurrenceType)
    if (clientErrors.length > 0) {
      return clientErrors
    }

    const result = await apiClient.post('/todo/', toCreateTodoRequest(data))
    if (!result.ok) {
      return toTodoMutationErrors(result.error)
    }
    await fetchTodos(lastSearch)
  }

  const updateTodo = async (todo: Todo): Promise<readonly ValidationError[] | undefined> => {
    const clientErrors = validateTodoForm(todo.name, todo.detail, todo.dueDate, todo.recurrenceType)
    if (clientErrors.length > 0) {
      return clientErrors
    }

    const { id } = todo
    const result = await apiClient.put(todoPath(id), toUpdateTodoRequest(todo))
    if (!result.ok) {
      return toTodoMutationErrors(result.error)
    }
    await fetchTodos(lastSearch)
  }

  const toggleTodoCompletion = async (todo: Todo): Promise<readonly ValidationError[] | undefined> => {
    return updateTodo({
      ...todo,
      progressStatus: todo.progressStatus === 'completed' ? 'not_started' : 'completed',
    })
  }

  const removeTodo = async (id: number) => {
    await apiClient.delete(todoPath(id))
    await fetchTodos(lastSearch)
  }

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
