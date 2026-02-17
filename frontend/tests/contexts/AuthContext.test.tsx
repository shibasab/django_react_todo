import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import type { ApiClient } from '../../src/services/api'

import { ApiProvider } from '../../src/contexts/ApiContext'
import { AuthProvider } from '../../src/contexts/AuthContext'
import { useAuth } from '../../src/hooks/useAuth'
import { resetLocalStorageMock } from '../helpers/localStorageMock'

const AuthProbe = () => {
  const { authState, login, register, logout } = useAuth()

  return (
    <div>
      <p data-testid="status">{authState.status}</p>
      <button onClick={() => void login('u', 'p')}>login</button>
      <button onClick={() => void register('u', 'e@example.com', 'p')}>register</button>
      <button onClick={() => void logout()}>logout</button>
    </div>
  )
}

const renderWithClient = (apiClient: ApiClient) =>
  render(
    <ApiProvider client={apiClient}>
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>
    </ApiProvider>,
  )

describe('AuthContext', () => {
  it('トークン無しでは未認証状態になる', async () => {
    resetLocalStorageMock()
    const apiClient = {
      get: vi.fn(async () => ({ id: 1, username: 'u', email: 'e@example.com' })),
      post: vi.fn(async () => ({
        ok: true,
        data: { user: { id: 1, username: 'u', email: 'e@example.com' }, token: 't' },
      })),
      put: vi.fn(),
      delete: vi.fn(),
    } as unknown as ApiClient

    const { container } = renderWithClient(apiClient)

    await waitFor(() => {
      expect(screen.getByTestId('status')).toHaveTextContent('unauthenticated')
    })
    expect(container).toMatchSnapshot()
  })

  it('login/register/logoutの振る舞いで認証状態が遷移する', async () => {
    resetLocalStorageMock()
    const apiClient = {
      get: vi.fn(async () => ({ id: 1, username: 'u', email: 'e@example.com' })),
      post: vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          data: { user: { id: 1, username: 'u', email: 'e@example.com' }, token: 't1' },
        })
        .mockResolvedValueOnce({
          ok: true,
          data: { user: { id: 1, username: 'u', email: 'e@example.com' }, token: 't2' },
        })
        .mockResolvedValueOnce({ ok: true, data: undefined }),
      put: vi.fn(),
      delete: vi.fn(),
    } as unknown as ApiClient

    const { container } = renderWithClient(apiClient)

    await waitFor(() => {
      expect(screen.getByTestId('status')).toHaveTextContent('unauthenticated')
    })

    fireEvent.click(screen.getByRole('button', { name: 'login' }))
    await waitFor(() => {
      expect(screen.getByTestId('status')).toHaveTextContent('authenticated')
    })

    fireEvent.click(screen.getByRole('button', { name: 'register' }))
    await waitFor(() => {
      expect(screen.getByTestId('status')).toHaveTextContent('authenticated')
    })

    fireEvent.click(screen.getByRole('button', { name: 'logout' }))
    await waitFor(() => {
      expect(screen.getByTestId('status')).toHaveTextContent('unauthenticated')
    })

    expect(container).toMatchSnapshot()
  })

  it('トークンありでユーザー取得失敗時はトークン削除して未認証に戻る', async () => {
    resetLocalStorageMock()
    localStorage.setItem('token', 'existing')
    const apiClient = {
      get: vi.fn(async () => {
        throw new Error('401')
      }),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    } as unknown as ApiClient

    const { container } = renderWithClient(apiClient)

    await waitFor(() => {
      expect(screen.getByTestId('status')).toHaveTextContent('unauthenticated')
    })
    expect(container).toMatchSnapshot()
  })

  it('login/register失敗時は認証状態を変更しない', async () => {
    resetLocalStorageMock()
    const apiClient = {
      get: vi.fn(async () => ({ id: 1, username: 'u', email: 'e@example.com' })),
      post: vi
        .fn()
        .mockResolvedValueOnce({ ok: false, error: { status: 422 } })
        .mockResolvedValueOnce({ ok: false, error: { status: 422 } }),
      put: vi.fn(),
      delete: vi.fn(),
    } as unknown as ApiClient

    const { container } = renderWithClient(apiClient)

    await waitFor(() => {
      expect(screen.getByTestId('status')).toHaveTextContent('unauthenticated')
    })

    fireEvent.click(screen.getByRole('button', { name: 'login' }))
    fireEvent.click(screen.getByRole('button', { name: 'register' }))

    await waitFor(() => {
      expect(screen.getByTestId('status')).toHaveTextContent('unauthenticated')
    })

    expect(container).toMatchSnapshot()
  })
})
