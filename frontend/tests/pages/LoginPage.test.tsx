import { screen, waitFor, fireEvent,within } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'

import { createMockApiClient } from '../helpers/apiMock'
import { renderApp } from '../helpers/renderPage'

// localStorage のモック
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    }),
  }
})()

Object.defineProperty(window, 'localStorage', { value: localStorageMock })

describe('ログインフロー', () => {
  const mockUser = { id: 1, username: 'testuser', email: 'test@example.com' }
  const mockAuthResponse = { user: mockUser, token: 'test-token-123' }

  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  describe('LoginPage 初期表示', () => {
    it('ログインフォームが正しく表示される', async () => {
      const { client } = createMockApiClient({})

      const { container } = renderApp({ apiClient: client, initialRoute: '/login' })

      // ローディング完了を待機
      await waitFor(() => {
        expect(within(container).queryByText('Loading...')).not.toBeInTheDocument()
      })

      // フォーム要素の確認
      expect(within(container).getByLabelText('Username')).toBeInTheDocument()
      expect(within(container).getByLabelText('Password')).toBeInTheDocument()
      expect(within(container).getByRole('button', { name: 'Login' })).toBeInTheDocument()
      expect(within(container).getByText("Don't have an account?")).toBeInTheDocument()
      expect(within(container).getAllByRole('link', { name: /register/i }).length).toBeGreaterThan(0)

      // DOMスナップショット
      expect(container).toMatchSnapshot('login-page-initial')
    })
  })

  describe('ログイン成功', () => {
    it('正しい認証情報でログイン → API呼び出し → ダッシュボードへリダイレクト', async () => {
      const { client, requests } = createMockApiClient({
        postResponse: mockAuthResponse,
        getResponse: [], // TODO一覧（空）
      })

      const { container } = renderApp({ apiClient: client, initialRoute: '/login' })

      // ローディング完了を待機
      await waitFor(() => {
        expect(within(container).queryByText('Loading...')).not.toBeInTheDocument()
      })

      // フォーム入力
      fireEvent.change(within(container).getByLabelText('Username'), { target: { value: 'testuser' } })
      fireEvent.change(within(container).getByLabelText('Password'), { target: { value: 'password123' } })

      // ログインボタンをクリック
      fireEvent.click(within(container).getByRole('button', { name: 'Login' }))

      // API呼び出しを検証
      await waitFor(() => {
        const loginRequest = requests.find((r) => r.url === '/auth/login')
        expect(loginRequest).toBeDefined()
        expect(loginRequest?.method).toBe('POST')
        expect(loginRequest?.data).toEqual({ username: 'testuser', password: 'password123' })
      })

      // トークン保存を検証
      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith('token', 'test-token-123')
      })

      // ダッシュボードへリダイレクト（Header表示確認）
      await waitFor(() => {
        expect(within(container).getByText('Welcome testuser')).toBeInTheDocument()
      })

      // APIリクエストのスナップショット
      expect(requests).toMatchSnapshot('login-api-requests')
    })
  })

  describe('認証状態によるリダイレクト', () => {
    it('認証済みユーザーが /login にアクセス → / へリダイレクト', async () => {
      // トークンを事前にセット
      localStorageMock.setItem('token', 'existing-token')

      const { client } = createMockApiClient({
        getResponses: {
          '/auth/user': mockUser,
          '/todos': [],
        },
      })

      const   { container } = renderApp({ apiClient: client, initialRoute: '/login' })

      // ダッシュボードへリダイレクトされることを確認
      await waitFor(() => {
        expect(within(container).getByText('Welcome testuser')).toBeInTheDocument()
      })

      // ログインフォームが表示されていないことを確認
      expect(within(container).queryByLabelText('Username')).not.toBeInTheDocument()
    })
  })
})
