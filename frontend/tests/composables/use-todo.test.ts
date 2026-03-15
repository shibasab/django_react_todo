import { todoPath } from '@todoapp/shared'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'

import { useTodo } from '../../src/composables/useTodo'
import type { CreateTodoInput, Todo } from '../../src/models/todo'

const apiClientMock = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
}

const storeMock = {
  apiClient: apiClientMock,
  isLoading: ref(false),
}

vi.mock('../../src/stores/api', () => ({
  useApiStore: () => storeMock,
}))

const apiTodo = (overrides: Partial<Todo> = {}): Todo => ({
  id: 1,
  name: 'todo',
  detail: '',
  dueDate: null,
  progressStatus: 'not_started',
  recurrenceType: 'none',
  ...overrides,
})

const createTodoInput = (overrides: Partial<CreateTodoInput> = {}): CreateTodoInput => ({
  name: 'new todo',
  detail: '',
  dueDate: null,
  progressStatus: 'not_started',
  recurrenceType: 'none',
  ...overrides,
})

describe('useTodo', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    apiClientMock.get.mockResolvedValue([apiTodo()])
    apiClientMock.post.mockResolvedValue({ ok: true, data: apiTodo() })
    apiClientMock.put.mockResolvedValue({ ok: true, data: apiTodo() })
    apiClientMock.delete.mockResolvedValue({ detail: 'ok' })
  })

  it('検索条件を整形してfetchTodosに反映する', async () => {
    const todo = useTodo()

    await todo.fetchTodos({
      keyword: '  keyword  ',
      status: 'in_progress',
      dueDate: 'overdue',
    })

    expect(apiClientMock.get).toHaveBeenCalledWith('/todo/', {
      params: {
        keyword: 'keyword',
        progressStatus: 'in_progress',
        dueDate: 'overdue',
      },
      options: {
        key: 'todo-search',
        mode: 'latestOnly',
      },
    })
    expect(todo.todos.value).toHaveLength(1)
  })

  it('addTodoはクライアントバリデーションエラー時にPOSTしない', async () => {
    const todo = useTodo()

    const errors = await todo.addTodo(createTodoInput({ name: '' }))

    expect(errors).toEqual([{ field: 'name', reason: 'required' }])
    expect(apiClientMock.post).not.toHaveBeenCalled()
  })

  it('addTodoは409エラーをglobalエラーとして返す', async () => {
    apiClientMock.post.mockResolvedValueOnce({
      ok: false,
      error: {
        status: 409,
        type: 'conflict_error',
        detail: 'conflict',
      },
    })

    const todo = useTodo()
    const errors = await todo.addTodo(createTodoInput())

    expect(errors).toEqual([{ field: 'global', reason: 'conflict' }])
  })

  it('addTodo成功時は直前検索条件で再取得する', async () => {
    const todo = useTodo()

    await todo.fetchTodos({ keyword: 'x', status: 'all', dueDate: 'all' })
    await todo.addTodo(createTodoInput())

    expect(apiClientMock.get).toHaveBeenCalledTimes(2)
    expect(apiClientMock.get).toHaveBeenLastCalledWith('/todo/', {
      params: { keyword: 'x' },
      options: {
        key: 'todo-search',
        mode: 'latestOnly',
      },
    })
  })

  it('updateTodo成功時はPUTして再取得する', async () => {
    const todo = useTodo()

    await todo.fetchTodos({ keyword: '', status: 'all', dueDate: 'all' })
    const target = apiTodo({ id: 20, detail: 'detail' })
    const result = await todo.updateTodo(target)

    expect(result).toBeUndefined()
    expect(apiClientMock.put).toHaveBeenCalledWith(todoPath(20), {
      name: 'todo',
      detail: 'detail',
      dueDate: null,
      progressStatus: 'not_started',
      recurrenceType: 'none',
    })
    expect(apiClientMock.get).toHaveBeenCalledTimes(2)
  })

  it('toggleTodoCompletionは完了状態を切り替えて更新する', async () => {
    const todo = useTodo()

    await todo.toggleTodoCompletion(apiTodo({ id: 30, progressStatus: 'completed' }))

    expect(apiClientMock.put).toHaveBeenCalledWith(
      todoPath(30),
      expect.objectContaining({ progressStatus: 'not_started' }),
    )
  })

  it('removeTodoはDELETE後に再取得する', async () => {
    const todo = useTodo()

    await todo.fetchTodos({ keyword: '', status: 'all', dueDate: 'all' })
    await todo.removeTodo(10)

    expect(apiClientMock.delete).toHaveBeenCalledWith('/todo/10/')
    expect(apiClientMock.get).toHaveBeenCalledTimes(2)
  })
})
