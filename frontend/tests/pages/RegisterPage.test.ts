import { waitFor, fireEvent, within } from '@testing-library/vue'
import { describe, it, expect, beforeEach, afterEach } from 'vitest'

import { summarizeFormControls } from '../helpers/domSnapshot'
import { setupHttpFixtureTest } from '../helpers/httpMock'
import { localStorageMock, resetLocalStorageMock } from '../helpers/localStorageMock'
import { renderApp, cleanupTestApiClient } from '../helpers/renderPage'

describe('RegisterPage', () => {
  beforeEach(() => {
    resetLocalStorageMock()
  })

  afterEach(() => {
    cleanupTestApiClient()
  })

  describe('初期表示', () => {
    it('登録フォームが正しく表示される', async () => {
      const { apiClient } = setupHttpFixtureTest()

      const { container } = await renderApp({ apiClient, initialRoute: '/register' })

      await waitFor(() => {
        expect(within(container).queryByText('Loading...')).not.toBeInTheDocument()
      })

      expect(within(container).getByLabelText('Username')).toBeInTheDocument()
      expect(within(container).getByLabelText('Email')).toBeInTheDocument()
      expect(within(container).getByLabelText('Password')).toBeInTheDocument()
      expect(within(container).getByLabelText('Confirm Password')).toBeInTheDocument()
      expect(within(container).getByRole('button', { name: 'Register' })).toBeInTheDocument()

      expect(summarizeFormControls(container)).toMatchSnapshot('register-page-initial-form')
    })
  })

  describe('登録成功', () => {
    it('正しい情報で登録 → API呼び出し → ダッシュボードへリダイレクト', async () => {
      const { apiClient, requestLog } = setupHttpFixtureTest({
        scenarioFixture: 'scenarios/auth/register.success.json',
      })

      const { container } = await renderApp({ apiClient, initialRoute: '/register' })

      await waitFor(() => {
        expect(within(container).queryByText('Loading...')).not.toBeInTheDocument()
      })

      await fireEvent.update(within(container).getByLabelText('Username'), 'newuser')
      await fireEvent.update(within(container).getByLabelText('Email'), 'new@example.com')
      await fireEvent.update(within(container).getByLabelText('Password'), 'password123')
      await fireEvent.update(within(container).getByLabelText('Confirm Password'), 'password123')
      await fireEvent.click(within(container).getByRole('button', { name: 'Register' }))

      await waitFor(() => {
        const registerRequest = requestLog.find((r) => r.url === '/auth/register')
        expect(registerRequest).toBeDefined()
        expect(registerRequest?.method).toBe('POST')
      })

      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith('token', expect.any(String))
      })
    })
  })
})
