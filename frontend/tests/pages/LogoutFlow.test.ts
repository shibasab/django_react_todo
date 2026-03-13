import { waitFor, within, fireEvent } from '@testing-library/vue'
import { describe, it, expect, afterEach } from 'vitest'

import { setupHttpFixtureTest } from '../helpers/httpMock'
import { localStorageMock, resetLocalStorageMock } from '../helpers/localStorageMock'
import { renderApp, cleanupTestApiClient } from '../helpers/renderPage'

describe('ログアウトフロー', () => {
  afterEach(() => {
    cleanupTestApiClient()
    resetLocalStorageMock()
  })

  it('ログアウトボタンをクリックするとログインページへ遷移する', async () => {
    const { apiClient, requestLog } = setupHttpFixtureTest({
      scenarioFixture: 'scenarios/auth/authenticated.empty-todos.json',
      routes: [{ method: 'POST', url: '/auth/logout', response: null }],
    })

    const { container } = await renderApp({ apiClient, initialRoute: '/', isAuthenticated: true })

    await waitFor(() => {
      expect(within(container).getByText('Welcome testuser')).toBeInTheDocument()
    })

    await fireEvent.click(within(container).getByRole('button', { name: 'Logout' }))

    await waitFor(() => {
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('token')
    })

    await waitFor(() => {
      const logoutRequest = requestLog.find((r) => r.url === '/auth/logout')
      expect(logoutRequest).toBeDefined()
    })
  })
})
