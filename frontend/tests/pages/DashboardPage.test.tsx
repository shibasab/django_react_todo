import { waitFor, fireEvent, within, act } from '@testing-library/react'
import { describe, it, expect } from 'vitest'

import { createMockApiClient } from '../helpers/apiMock'
import { renderApp } from '../helpers/renderPage'

describe('DashboardPage', () => {
  const mockTodos = [
    { id: 1, name: 'Test Todo 1', detail: 'Detail 1', isCompleted: false },
    { id: 2, name: 'Test Todo 2', detail: 'Detail 2', isCompleted: true },
  ]

  describe('初期表示', () => {
    it('ページレンダリング時にGET APIが呼ばれ、TODOリストが表示される', async () => {
      const { client, requests } = createMockApiClient({
        getResponse: mockTodos,
      })

      const { container } = renderApp({ apiClient: client, initialRoute: '/', isAuthenticated: true })

      // APIリクエストを検証
      await waitFor(() => {
        expect(requests).toMatchSnapshot('api-requests')
      })

      // 画面表示を検証
      await waitFor(() => {
        expect(within(container).getByText('Test Todo 1')).toBeInTheDocument()
        expect(within(container).getByText('Test Todo 2')).toBeInTheDocument()
        expect(within(container).getByLabelText('検索')).toBeInTheDocument()
        expect(within(container).getByLabelText('状態')).toBeInTheDocument()
        expect(within(container).getByLabelText('期限')).toBeInTheDocument()
        expect(within(container).getByRole('button', { name: 'クリア' })).toBeInTheDocument()
      })

      // DOMスナップショット
      expect(container).toMatchSnapshot('dom')
    })
  })

  describe('TODO追加', () => {
    it('タスク名入力→追加ボタンでPOST APIが呼ばれる', async () => {
      const { client, requests, clearRequests } = createMockApiClient({
        getResponse: mockTodos,
        postResponse: { id: 3, name: 'New Todo', detail: 'New Detail', isCompleted: false },
      })

      const { container } = renderApp({ apiClient: client, initialRoute: '/', isAuthenticated: true })

      // 初期表示完了を待機（TODOリストが表示されるまで）
      await waitFor(() => {
        expect(within(container).getByText('Test Todo 1')).toBeInTheDocument()
      })
      clearRequests()

      // フォーム入力
      const nameInput = within(container).getByLabelText('Task')
      const detailInput = within(container).getByLabelText('Detail')
      const submitButton = within(container).getByRole('button', { name: /submit/i })

      fireEvent.change(nameInput, { target: { value: 'New Todo' } })
      fireEvent.change(detailInput, { target: { value: 'New Detail' } })
      fireEvent.click(submitButton)

      // APIリクエストを検証
      await waitFor(() => {
        expect(requests).toMatchSnapshot('api-requests-add')
      })
    })
  })

  describe('検索・フィルタ', () => {
    it('検索条件の変更後にデバウンスしてGET APIが呼ばれる', async () => {
      const { client, requests, clearRequests } = createMockApiClient({
        getResponse: mockTodos,
      })

      const { container } = renderApp({ apiClient: client, initialRoute: '/', isAuthenticated: true })

      await waitFor(() => {
        expect(within(container).getByText('Test Todo 1')).toBeInTheDocument()
      })
      clearRequests()

      const keywordInput = within(container).getByLabelText('検索')
      const statusSelect = within(container).getByLabelText('状態')
      const dueDateSelect = within(container).getByLabelText('期限')

      fireEvent.change(keywordInput, { target: { value: 'Test' } })
      fireEvent.change(statusSelect, { target: { value: 'completed' } })
      fireEvent.change(dueDateSelect, { target: { value: 'today' } })

      expect(requests.length).toBe(0)

      await act(async () => {
        await new Promise((resolve) => {
          setTimeout(resolve, 350)
        })
      })

      await waitFor(() => {
        expect(requests).toMatchSnapshot('api-requests-search')
      })
    })
  })

  describe('TODO削除', () => {
    it('削除ボタンクリックでDELETE APIが呼ばれる', async () => {
      const { client, requests, clearRequests } = createMockApiClient({
        getResponse: mockTodos,
      })

      const { container } = renderApp({ apiClient: client, initialRoute: '/', isAuthenticated: true })

      // 初期表示完了を待機
      await waitFor(() => {
        expect(within(container).getByText('Test Todo 1')).toBeInTheDocument()
      })
      clearRequests()

      // 削除ボタンをクリック
      const deleteButtons = within(container).getAllByRole('button', { name: /delete/i })
      fireEvent.click(deleteButtons[0])

      // APIリクエストを検証
      await waitFor(() => {
        expect(requests).toMatchSnapshot('api-requests-delete')
      })
    })
  })

  describe('TODO更新', () => {
    it('編集ボタンクリックで編集フォームが表示される', async () => {
      const { client } = createMockApiClient({
        getResponse: mockTodos,
      })

      const { container } = renderApp({ apiClient: client, initialRoute: '/', isAuthenticated: true })

      // 初期表示完了を待機
      await waitFor(() => {
        expect(within(container).getByText('Test Todo 1')).toBeInTheDocument()
      })

      // 編集ボタンをクリック
      const editButtons = within(container).getAllByRole('button', { name: /edit/i })
      fireEvent.click(editButtons[0])

      // 編集フォームが表示される
      await waitFor(() => {
        expect(within(container).getByLabelText('タスク名')).toBeInTheDocument()
        expect(within(container).getByLabelText('詳細')).toBeInTheDocument()
        expect(within(container).getByRole('button', { name: /save/i })).toBeInTheDocument()
        expect(within(container).getByRole('button', { name: /cancel/i })).toBeInTheDocument()
      })
    })

    it('値変更→保存ボタンでPUT APIが呼ばれる', async () => {
      const { client, requests, clearRequests } = createMockApiClient({
        getResponse: mockTodos,
        putResponse: { id: 1, name: 'Updated Todo', detail: 'Updated Detail', isCompleted: false },
      })

      const { container } = renderApp({ apiClient: client, initialRoute: '/', isAuthenticated: true })

      // 初期表示完了を待機
      await waitFor(() => {
        expect(within(container).getByText('Test Todo 1')).toBeInTheDocument()
      })

      // 編集ボタンをクリック
      const editButtons = within(container).getAllByRole('button', { name: /edit/i })
      fireEvent.click(editButtons[0])

      // 編集フォームが表示されるまで待機
      await waitFor(() => {
        expect(within(container).getByLabelText('タスク名')).toBeInTheDocument()
      })
      clearRequests()

      // 値を変更
      const nameInput = within(container).getByLabelText('タスク名')
      const detailInput = within(container).getByLabelText('詳細')
      fireEvent.change(nameInput, { target: { value: 'Updated Todo' } })
      fireEvent.change(detailInput, { target: { value: 'Updated Detail' } })

      // 保存ボタンをクリック
      const saveButton = within(container).getByRole('button', { name: /save/i })
      fireEvent.click(saveButton)

      // APIリクエストを検証
      await waitFor(() => {
        expect(requests).toMatchSnapshot('api-requests-update')
      })
    })

    it('キャンセルボタンで編集モード終了', async () => {
      const { client } = createMockApiClient({
        getResponse: mockTodos,
      })

      const { container } = renderApp({ apiClient: client, initialRoute: '/', isAuthenticated: true })

      // 初期表示完了を待機
      await waitFor(() => {
        expect(within(container).getByText('Test Todo 1')).toBeInTheDocument()
      })

      // 編集ボタンをクリック
      const editButtons = within(container).getAllByRole('button', { name: /edit/i })
      fireEvent.click(editButtons[0])

      // 編集フォームが表示されるまで待機
      await waitFor(() => {
        expect(within(container).getByLabelText('タスク名')).toBeInTheDocument()
      })

      // キャンセルボタンをクリック
      const cancelButton = within(container).getByRole('button', { name: /cancel/i })
      fireEvent.click(cancelButton)

      // 編集フォームが非表示になる
      await waitFor(() => {
        expect(within(container).queryByLabelText('タスク名')).not.toBeInTheDocument()
        expect(within(container).getByText('Test Todo 1')).toBeInTheDocument()
      })
    })

    it('タスク名が空の場合はバリデーションエラー', async () => {
      const { client, requests, clearRequests } = createMockApiClient({
        getResponse: mockTodos,
      })

      const { container } = renderApp({ apiClient: client, initialRoute: '/', isAuthenticated: true })

      // 初期表示完了を待機
      await waitFor(() => {
        expect(within(container).getByText('Test Todo 1')).toBeInTheDocument()
      })

      // 編集ボタンをクリック
      const editButtons = within(container).getAllByRole('button', { name: /edit/i })
      fireEvent.click(editButtons[0])

      // 編集フォームが表示されるまで待機
      await waitFor(() => {
        expect(within(container).getByLabelText('タスク名')).toBeInTheDocument()
      })
      clearRequests()

      // タスク名を空にする
      const nameInput = within(container).getByLabelText('タスク名')
      fireEvent.change(nameInput, { target: { value: '' } })

      // 保存ボタンをクリック
      const saveButton = within(container).getByRole('button', { name: /save/i })
      fireEvent.click(saveButton)

      // エラーメッセージが表示される
      await waitFor(() => {
        expect(within(container).getByText('タスク名を入力してください')).toBeInTheDocument()
      })

      // API呼び出しがないことを確認
      expect(requests.length).toBe(0)
    })

    it('チェックボックスクリックで完了状態が更新される', async () => {
      const { client, requests, clearRequests } = createMockApiClient({
        getResponse: mockTodos,
        putResponse: { id: 1, name: 'Test Todo 1', detail: 'Detail 1', isCompleted: true },
      })

      const { container } = renderApp({ apiClient: client, initialRoute: '/', isAuthenticated: true })

      await waitFor(() => {
        expect(within(container).getByText('Test Todo 1')).toBeInTheDocument()
      })
      clearRequests()

      // 1つ目のTODOのチェックボックスをクリック（未完了 -> 完了）
      const checkboxes = within(container).getAllByRole('checkbox')
      fireEvent.click(checkboxes[0])

      await waitFor(() => {
        expect(requests).toMatchSnapshot('api-requests-toggle')
      })
    })
  })
})
