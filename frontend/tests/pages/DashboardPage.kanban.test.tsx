import { fireEvent, waitFor, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { setupHttpFixtureTest } from '../helpers/httpMock'
import { renderApp } from '../helpers/renderPage'

describe('DashboardPage Kanban', () => {
  it('カンバンで列移動するとPUTされ、一覧表示へ反映される', async () => {
    const { apiClient, requestLog, clearRequests } = setupHttpFixtureTest({
      scenarioFixture: 'scenarios/dashboard/authenticated.default.json',
      routes: [
        {
          method: 'PUT',
          url: /\/todo\/1\/?$/,
          responseFixture: 'api/todo/update.to-in-progress.json',
        },
      ],
    })

    const { container } = renderApp({ apiClient, initialRoute: '/', isAuthenticated: true })

    await waitFor(() => {
      expect(within(container).getByText('Test Todo 1')).toBeInTheDocument()
    })

    fireEvent.click(within(container).getByRole('button', { name: 'カンバン表示' }))

    await waitFor(() => {
      const notStartedColumn = within(container).getByTestId('kanban-column-not_started')
      expect(within(notStartedColumn).getByText('Test Todo 1')).toBeInTheDocument()
    })

    clearRequests()

    const card = within(container).getByTestId('kanban-card-1')
    const targetColumn = within(container).getByTestId('kanban-column-in_progress')
    const dataTransfer = { setData: () => {}, effectAllowed: 'move' } as unknown as DataTransfer

    fireEvent.dragStart(card, { dataTransfer })
    fireEvent.drop(targetColumn)

    await waitFor(() => {
      const putRequest = requestLog.find((entry) => entry.method === 'PUT' && entry.url === '/todo/1/')
      expect(putRequest).toBeDefined()
    })

    const putRequest = requestLog.find((entry) => entry.method === 'PUT' && entry.url === '/todo/1/')
    expect(putRequest).toMatchSnapshot('kanban-move-put-request')

    fireEvent.click(within(container).getByRole('button', { name: '一覧表示' }))

    await waitFor(() => {
      expect(within(container).getByText('進捗: 進行中')).toBeInTheDocument()
    })
  })
})
