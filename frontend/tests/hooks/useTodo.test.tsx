import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import type { Todo } from '../../src/models/todo'
import type { ApiClient } from '../../src/services/api'

import { ApiProvider } from '../../src/contexts/ApiContext'
import { useTodo } from '../../src/hooks/useTodo'

type ProbeProps = Readonly<{
  todo: Todo
}>

const Probe = ({ todo }: ProbeProps) => {
  const todoService = useTodo()

  return (
    <div>
      <p data-testid="todo-count">{todoService.todos.length}</p>
      <button onClick={() => void todoService.fetchTodos()}>fetch</button>
      <button
        onClick={() => void todoService.fetchTodos({ keyword: '  key  ', status: 'completed', dueDate: 'today' })}
      >
        fetchWithCriteria
      </button>
      <button
        onClick={() =>
          void todoService.addTodo({
            name: 'new',
            detail: '',
            dueDate: null,
            progressStatus: 'not_started',
            recurrenceType: 'none',
          })
        }
      >
        add
      </button>
      <button onClick={() => void todoService.updateTodo(todo)}>update</button>
      <button onClick={() => void todoService.toggleTodoCompletion(todo)}>toggle</button>
      <button onClick={() => void todoService.removeTodo(todo.id)}>remove</button>
      <button
        onClick={() => {
          const errors = todoService.validateTodo('', '', null, 'weekly')
          ;(document.querySelector('#errors') as HTMLElement).textContent = JSON.stringify(errors)
        }}
      >
        validate
      </button>
      <pre id="errors" />
    </div>
  )
}

const TODO: Todo = {
  id: 1,
  name: 'task',
  detail: 'd',
  dueDate: '2026-01-01',
  progressStatus: 'not_started',
  recurrenceType: 'none',
}

const renderProbe = (apiClient: ApiClient) =>
  render(
    <ApiProvider client={apiClient}>
      <Probe todo={TODO} />
    </ApiProvider>,
  )

describe('useTodo', () => {
  it('fetchTodosは検索条件を正規化してGETを呼び出す', async () => {
    const apiClient = {
      get: vi.fn(async () => [TODO]),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    } as unknown as ApiClient

    const { container } = renderProbe(apiClient)

    fireEvent.click(screen.getByRole('button', { name: 'fetchWithCriteria' }))

    await waitFor(() => {
      expect(apiClient.get).toHaveBeenCalledWith('/todo/', {
        params: { keyword: 'key', progress_status: 'completed', due_date: 'today' },
        options: { key: 'todo-search', mode: 'latestOnly' },
      })
    })
    expect(container).toMatchSnapshot()
  })

  it('add/update/toggle/removeで対応するAPIを呼び、成功時に再取得する', async () => {
    const apiClient = {
      get: vi.fn(async () => [TODO]),
      post: vi.fn(async () => ({ ok: true, data: TODO })),
      put: vi.fn(async () => ({ ok: true, data: TODO })),
      delete: vi.fn(async () => undefined),
    } as unknown as ApiClient

    const { container } = renderProbe(apiClient)

    fireEvent.click(screen.getByRole('button', { name: 'fetch' }))
    await waitFor(() => expect(apiClient.get).toHaveBeenCalledTimes(1))

    fireEvent.click(screen.getByRole('button', { name: 'add' }))
    fireEvent.click(screen.getByRole('button', { name: 'update' }))
    fireEvent.click(screen.getByRole('button', { name: 'toggle' }))
    fireEvent.click(screen.getByRole('button', { name: 'remove' }))

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalled()
      expect(apiClient.put).toHaveBeenCalled()
      expect(apiClient.delete).toHaveBeenCalledWith('/todo/1/')
      expect(apiClient.get).toHaveBeenCalledTimes(5)
    })

    expect(container).toMatchSnapshot()
  })

  it('validateTodoは必須・繰り返し時の期限必須エラーを返す', () => {
    const apiClient = {
      get: vi.fn(async () => []),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    } as unknown as ApiClient

    renderProbe(apiClient)

    fireEvent.click(screen.getByRole('button', { name: 'validate' }))

    expect(
      screen.getByText('[{"field":"name","reason":"required"},{"field":"dueDate","reason":"required"}]'),
    ).toMatchSnapshot()
  })

  it('クライアントバリデーションエラー時はAPIを呼ばない', async () => {
    const apiClient = {
      get: vi.fn(async () => []),
      post: vi.fn(async () => ({ ok: true, data: TODO })),
      put: vi.fn(async () => ({ ok: true, data: TODO })),
      delete: vi.fn(async () => undefined),
    } as unknown as ApiClient

    const InvalidProbe = () => {
      const todoService = useTodo()
      return (
        <button
          onClick={() =>
            void todoService.addTodo({
              name: '',
              detail: '',
              dueDate: null,
              progressStatus: 'not_started',
              recurrenceType: 'weekly',
            })
          }
        >
          add-invalid
        </button>
      )
    }

    const { container } = render(
      <ApiProvider client={apiClient}>
        <InvalidProbe />
      </ApiProvider>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'add-invalid' }))

    await waitFor(() => {
      expect(apiClient.post).not.toHaveBeenCalled()
    })
    expect(container).toMatchSnapshot()
  })

  it('toggle/updateでバリデーションエラー時は再取得しない', async () => {
    const apiClient = {
      get: vi.fn(async () => []),
      post: vi.fn(async () => ({ ok: true, data: TODO })),
      put: vi.fn(async () => ({ ok: false, error: { errors: [{ field: 'name', reason: 'required' }] } })),
      delete: vi.fn(async () => undefined),
    } as unknown as ApiClient

    const { container } = renderProbe(apiClient)

    fireEvent.click(screen.getByRole('button', { name: 'toggle' }))

    await waitFor(() => {
      expect(apiClient.put).toHaveBeenCalled()
      expect(apiClient.get).not.toHaveBeenCalled()
    })
    expect(container).toMatchSnapshot()
  })
})
