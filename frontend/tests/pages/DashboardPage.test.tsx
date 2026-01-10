import { screen, waitFor, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'

import { DashboardPage } from '../../src/pages/DashboardPage'
import { createMockApiClient } from '../helpers/apiMock'
import { renderPage } from '../helpers/renderPage'

describe('DashboardPage', () => {
  const mockTodos = [
    { id: 1, name: 'Test Todo 1', detail: 'Detail 1' },
    { id: 2, name: 'Test Todo 2', detail: 'Detail 2' },
  ]

  describe('初期表示', () => {
    it('ページレンダリング時にGET APIが呼ばれ、TODOリストが表示される', async () => {
      const { client, requests } = createMockApiClient({
        getResponse: mockTodos,
      })

      renderPage(<DashboardPage />, { apiClient: client })

      // APIリクエストを検証
      await waitFor(() => {
        expect(requests).toMatchSnapshot('api-requests')
      })

      // 画面表示を検証
      await waitFor(() => {
        expect(screen.getByText('Test Todo 1')).toBeInTheDocument()
        expect(screen.getByText('Test Todo 2')).toBeInTheDocument()
      })

      // DOMスナップショット
      expect(document.body).toMatchSnapshot('dom')
    })
  })

  describe('TODO追加', () => {
    it('タスク名入力→追加ボタンでPOST APIが呼ばれる', async () => {
      const { client, requests, clearRequests } = createMockApiClient({
        getResponse: mockTodos,
        postResponse: { id: 3, name: 'New Todo', detail: 'New Detail' },
      })

      renderPage(<DashboardPage />, { apiClient: client })

      // 初期表示のAPIリクエストをクリア
      await waitFor(() => {
        expect(requests.length).toBeGreaterThan(0)
      })
      clearRequests()

      // フォーム入力
      const nameInput = screen.getByLabelText('Task')
      const detailInput = screen.getByLabelText('Detail')
      const submitButton = screen.getByRole('button', { name: /submit/i })

      fireEvent.change(nameInput, { target: { value: 'New Todo' } })
      fireEvent.change(detailInput, { target: { value: 'New Detail' } })
      fireEvent.click(submitButton)

      // APIリクエストを検証
      await waitFor(() => {
        expect(requests).toMatchSnapshot('api-requests-add')
      })
    })
  })

  describe('TODO削除', () => {
    it('削除ボタンクリックでDELETE APIが呼ばれる', async () => {
      const { client, requests, clearRequests } = createMockApiClient({
        getResponse: mockTodos,
      })

      renderPage(<DashboardPage />, { apiClient: client })

      // 初期表示完了を待機
      await waitFor(() => {
        expect(screen.getByText('Test Todo 1')).toBeInTheDocument()
      })
      clearRequests()

      // 削除ボタンをクリック
      const deleteButtons = screen.getAllByRole('button', { name: /delete/i })
      fireEvent.click(deleteButtons[0])

      // APIリクエストを検証
      await waitFor(() => {
        expect(requests).toMatchSnapshot('api-requests-delete')
      })
    })
  })
})
