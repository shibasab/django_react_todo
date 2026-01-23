import { waitFor, fireEvent, within } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { toast } from 'react-toastify'
import { err } from '../../src/models/result'

import { createMockApiClient } from '../helpers/apiMock'
import { renderApp } from '../helpers/renderPage'

// Toastのモック
vi.mock('react-toastify', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
  ToastContainer: () => null,
}))

describe('DashboardPage Error Handling', () => {
  const mockTodos = [
    { id: 1, name: 'Test Todo 1', detail: 'Detail 1', isCompleted: false },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('タスク完了更新時のAPIエラー(500等)でトーストが表示される', async () => {
    const { client } = createMockApiClient({
      getResponse: mockTodos,
    })

    // putメソッドが例外を投げるようにする
    client.put = vi.fn().mockRejectedValue(new Error('Network Error'))

    const { container } = renderApp({ apiClient: client, initialRoute: '/', isAuthenticated: true })

    await waitFor(() => {
      expect(within(container).getByText('Test Todo 1')).toBeInTheDocument()
    })

    const checkboxes = within(container).getAllByRole('checkbox')
    fireEvent.click(checkboxes[0])

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('タスクの状態更新に失敗しました')
    })
  })

  it('タスク完了更新時のバリデーションエラー(422)でトーストが表示される', async () => {
    const { client } = createMockApiClient({
      getResponse: mockTodos,
    })

    // putメソッドがバリデーションエラーを返すようにする
    client.put = vi.fn().mockResolvedValue(
      err({
        errors: [{ field: 'name', message: 'Something went wrong' }],
      })
    )

    const { container } = renderApp({ apiClient: client, initialRoute: '/', isAuthenticated: true })

    await waitFor(() => {
      expect(within(container).getByText('Test Todo 1')).toBeInTheDocument()
    })

    const checkboxes = within(container).getAllByRole('checkbox')
    fireEvent.click(checkboxes[0])

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Something went wrong')
    })
  })
})
