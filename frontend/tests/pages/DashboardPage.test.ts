import { waitFor, within } from '@testing-library/vue'
import { describe, it, expect, afterEach } from 'vitest'

import { setupHttpFixtureTest } from '../helpers/httpMock'
import { resetLocalStorageMock } from '../helpers/localStorageMock'
import { renderApp, cleanupTestApiClient } from '../helpers/renderPage'

const setupAuthenticatedDashboard = (todoListFixture = 'api/todo/list.default.json') => {
  return setupHttpFixtureTest({
    scenarioFixture: 'scenarios/dashboard/authenticated.default.json',
    routes:
      todoListFixture === 'api/todo/list.default.json'
        ? []
        : [
            {
              method: 'GET',
              url: '/todo/',
              responseFixture: todoListFixture,
            },
          ],
  })
}

describe('DashboardPage', () => {
  afterEach(() => {
    cleanupTestApiClient()
    resetLocalStorageMock()
  })

  describe('初期表示', () => {
    it('ページレンダリング時にGET APIが呼ばれ、TODOリストが表示される', async () => {
      const { apiClient, requestLog } = setupAuthenticatedDashboard()

      const { container } = await renderApp({ apiClient, initialRoute: '/', isAuthenticated: true })

      await waitFor(() => {
        expect(requestLog).toMatchSnapshot('api-requests')
      })

      await waitFor(() => {
        expect(within(container).getByText('Test Todo 1')).toBeInTheDocument()
        expect(within(container).getByText('Test Todo 2')).toBeInTheDocument()
        expect(within(container).getByLabelText('検索')).toBeInTheDocument()
        expect(within(container).getByLabelText('状態')).toBeInTheDocument()
        expect(within(container).getByLabelText('期限')).toBeInTheDocument()
        expect(within(container).getByLabelText('クイック入力')).toBeInTheDocument()
        expect(within(container).getByRole('button', { name: '追加' })).toBeInTheDocument()
        expect(within(container).getByRole('button', { name: '詳細入力を開く' })).toBeInTheDocument()
        expect(within(container).getByRole('button', { name: 'クリア' })).toBeInTheDocument()
      })
    })
  })
})
