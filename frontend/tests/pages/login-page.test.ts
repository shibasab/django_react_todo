import { waitFor, fireEvent, within } from '@testing-library/vue'
import { AuthResponseSchema } from '@todoapp/shared'
import { describe, it, expect, beforeEach, afterEach } from 'vitest'

import { summarizeFormControls, summarizeText } from '../helpers/domSnapshot'
import { loadFixture } from '../helpers/fixtures'
import { setupHttpFixtureTest } from '../helpers/httpMock'
import { localStorageMock, resetLocalStorageMock } from '../helpers/localStorageMock'
import { renderApp, cleanupTestApiClient } from '../helpers/renderPage'

const mockAuthResponse = AuthResponseSchema.parse(loadFixture('api/auth/login.testuser.json'))

describe('ログインフロー', () => {
  beforeEach(() => {
    resetLocalStorageMock()
  })

  afterEach(() => {
    cleanupTestApiClient()
  })

  describe('LoginPage 初期表示', () => {
    it('ログインフォームが正しく表示される', async () => {
      const { apiClient } = setupHttpFixtureTest()

      const { container } = await renderApp({ apiClient, initialRoute: '/login' })

      await waitFor(() => {
        expect(within(container).queryByText('Loading...')).not.toBeInTheDocument()
      })

      expect(within(container).getByLabelText('Username')).toBeInTheDocument()
      expect(within(container).getByLabelText('Password')).toBeInTheDocument()
      expect(within(container).getByRole('button', { name: 'Login' })).toBeInTheDocument()

      expect(summarizeFormControls(container)).toMatchSnapshot('login-page-initial-form')
      expect(summarizeText(container)).toMatchSnapshot('login-page-initial-text')
    })
  })

  describe('ログイン成功', () => {
    it('正しい認証情報でログイン → API呼び出し → ダッシュボードへリダイレクト', async () => {
      const { apiClient, requestLog } = setupHttpFixtureTest({
        scenarioFixture: 'scenarios/auth/login.success.json',
      })

      const { container } = await renderApp({ apiClient, initialRoute: '/login' })

      await waitFor(() => {
        expect(within(container).queryByText('Loading...')).not.toBeInTheDocument()
      })

      await fireEvent.update(within(container).getByLabelText('Username'), 'testuser')
      await fireEvent.update(within(container).getByLabelText('Password'), 'password123')
      await fireEvent.click(within(container).getByRole('button', { name: 'Login' }))

      await waitFor(() => {
        const loginRequest = requestLog.find((r) => r.url === '/auth/login')
        expect(loginRequest).toBeDefined()
        expect(loginRequest?.method).toBe('POST')
        expect(loginRequest?.body).toEqual({ username: 'testuser', password: 'password123' })
      })

      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith('token', mockAuthResponse.token)
      })

      await waitFor(() => {
        expect(within(container).getByText(`Welcome ${mockAuthResponse.user.username}`)).toBeInTheDocument()
      })
    })
  })

  describe('認証状態によるリダイレクト', () => {
    it('認証済みユーザーが /login にアクセス → / へリダイレクト', async () => {
      localStorageMock.setItem('token', 'existing-token')

      const { apiClient } = setupHttpFixtureTest({
        scenarioFixture: 'scenarios/auth/authenticated.empty-todos.json',
      })

      const { container } = await renderApp({ apiClient, initialRoute: '/login' })

      await waitFor(() => {
        expect(within(container).getByText('Welcome testuser')).toBeInTheDocument()
      })

      expect(within(container).queryByLabelText('Username')).not.toBeInTheDocument()
    })
  })
})
