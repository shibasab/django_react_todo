import { screen, waitFor, fireEvent, within } from '@testing-library/react'
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

describe('新規登録フロー', () => {
  const mockUser = { id: 1, username: 'newuser', email: 'new@example.com' }
  const mockAuthResponse = { user: mockUser, token: 'new-user-token' }

  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  describe('RegisterPage 初期表示', () => {
    it('登録フォームが正しく表示される', async () => {
      const { client } = createMockApiClient({})

      const { container } = renderApp({ apiClient: client, initialRoute: '/register' })

      // ローディング完了を待機
      await waitFor(() => {
        expect(within(container).queryByText('Loading...')).not.toBeInTheDocument()
      })

      // フォーム要素の確認
      expect(within(container).getByLabelText('Username')).toBeInTheDocument()
      expect(within(container).getByLabelText('Email')).toBeInTheDocument()
      expect(within(container).getByLabelText('Password')).toBeInTheDocument()
      expect(within(container).getByLabelText('Confirm Password')).toBeInTheDocument()
      expect(within(container).getByRole('button', { name: 'Register' })).toBeInTheDocument()
      expect(within(container).getByText('Already have an account?')).toBeInTheDocument()
      expect(within(container).getAllByRole('link', { name: /login/i }).length).toBeGreaterThan(0)

      // DOMスナップショット
      expect(document.body).toMatchSnapshot('register-page-initial')
    })
  })

  describe('登録成功', () => {
    it('正しい情報で登録 → API呼び出し → ダッシュボードへリダイレクト', async () => {
      const { client, requests } = createMockApiClient({
        postResponse: mockAuthResponse,
        getResponse: [], // TODO一覧（空）
      })

      const { container } = renderApp({ apiClient: client, initialRoute: '/register' })

      // ローディング完了を待機
      await waitFor(() => {
        expect(within(container).queryByText('Loading...')).not.toBeInTheDocument()
      })

      // フォーム入力
      fireEvent.change(within(container).getByLabelText('Username'), { target: { value: 'newuser' } })
      fireEvent.change(within(container).getByLabelText('Email'), { target: { value: 'new@example.com' } })
      fireEvent.change(within(container).getByLabelText('Password'), { target: { value: 'password123' } })
      fireEvent.change(within(container).getByLabelText('Confirm Password'), { target: { value: 'password123' } })

      // 登録ボタンをクリック
      fireEvent.click(within(container).getByRole('button', { name: 'Register' }))

      // API呼び出しを検証
      await waitFor(() => {
        const registerRequest = requests.find((r) => r.url === '/auth/register')
        expect(registerRequest).toBeDefined()
        expect(registerRequest?.method).toBe('POST')
        expect(registerRequest?.data).toEqual({
          username: 'newuser',
          email: 'new@example.com',
          password: 'password123',
        })
      })

      // トークン保存を検証
      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith('token', 'new-user-token')
      })

      // ダッシュボードへリダイレクト（Header表示確認）
      await waitFor(() => {
        expect(within(container).getByText('Welcome newuser')).toBeInTheDocument()
      })

      // APIリクエストのスナップショット
      expect(requests).toMatchSnapshot('register-api-requests')
    })
  })

  describe('パスワード不一致', () => {
    it('パスワードと確認パスワードが一致しない場合、APIは呼ばれない', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const { client, requests } = createMockApiClient({})

      const { container } = renderApp({ apiClient: client, initialRoute: '/register' })

      // ローディング完了を待機
      await waitFor(() => {
        expect(within(container).queryByText('Loading...')).not.toBeInTheDocument()
      })

      // フォーム入力（パスワード不一致）
      fireEvent.change(within(container).getByLabelText('Username'), { target: { value: 'newuser' } })
      fireEvent.change(within(container).getByLabelText('Email'), { target: { value: 'new@example.com' } })
      fireEvent.change(within(container).getByLabelText('Password'), { target: { value: 'password123' } })
      fireEvent.change(within(container).getByLabelText('Confirm Password'), { target: { value: 'different' } })

      // 登録ボタンをクリック
      fireEvent.click(within(container).getByRole('button', { name: 'Register' }))

      // APIが呼ばれていないことを検証（少し待つ）
      await new Promise((resolve) => setTimeout(resolve, 100))
      const registerRequest = requests.find((r) => r.url === '/auth/register')
      expect(registerRequest).toBeUndefined()

      // エラーログを検証
      expect(consoleSpy).toHaveBeenCalledWith('Passwords do not match')

      consoleSpy.mockRestore()
    })
  })
})
