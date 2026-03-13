import { fireEvent, render, screen, waitFor } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'

import type { Todo } from '../../src/models/todo'

import TodoList from '../../src/components/todo/todo-list.vue'
import { summarizeText } from '../helpers/domSnapshot'

const BASE_TODO: Todo = {
  id: 1,
  name: 'テストTodo',
  detail: '詳細テスト',
  dueDate: '2025-01-15',
  progressStatus: 'not_started',
  recurrenceType: 'none',
  parentId: null,
}

const TODO_LIST: readonly Todo[] = [
  BASE_TODO,
  { ...BASE_TODO, id: 2, name: 'Todo 2', progressStatus: 'completed', detail: '', parentId: null },
]

const noopAsync = vi.fn().mockResolvedValue(undefined)
const noopDelete = vi.fn()

describe('TodoList', () => {
  it('Todoがない場合は空メッセージを表示する', () => {
    const { container } = render(TodoList, {
      props: {
        todos: [],
        hasSearchCriteria: false,
        onDelete: noopDelete,
        onEdit: noopAsync,
        onToggleCompletion: noopAsync,
      },
    })

    expect(summarizeText(container)).toContain('タスクはありません')
  })

  it('検索条件ありの空リストでは検索メッセージを表示する', () => {
    const { container } = render(TodoList, {
      props: {
        todos: [],
        hasSearchCriteria: true,
        onDelete: noopDelete,
        onEdit: noopAsync,
        onToggleCompletion: noopAsync,
      },
    })

    expect(summarizeText(container)).toContain('条件に一致するタスクがありません')
  })

  it('Todoリストを表示する', () => {
    render(TodoList, {
      props: {
        todos: TODO_LIST,
        hasSearchCriteria: false,
        onDelete: noopDelete,
        onEdit: noopAsync,
        onToggleCompletion: noopAsync,
      },
    })

    expect(screen.getByText('テストTodo')).toBeInTheDocument()
    expect(screen.getByText('Todo 2')).toBeInTheDocument()
  })

  it('DeleteボタンをクリックするとonDeleteが呼ばれる', async () => {
    const onDelete = vi.fn()
    render(TodoList, {
      props: {
        todos: [BASE_TODO],
        hasSearchCriteria: false,
        onDelete,
        onEdit: noopAsync,
        onToggleCompletion: noopAsync,
      },
    })

    await fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
    expect(onDelete).toHaveBeenCalledWith(1)
  })

  it('Editボタンで編集モードに切り替わり、保存時に入力を整形してonEditを呼ぶ', async () => {
    const onEdit = vi.fn().mockResolvedValue(undefined)
    render(TodoList, {
      props: {
        todos: [BASE_TODO],
        hasSearchCriteria: false,
        onDelete: noopDelete,
        onEdit,
        onToggleCompletion: noopAsync,
      },
    })

    await fireEvent.click(screen.getByRole('button', { name: 'Edit' }))
    await fireEvent.update(screen.getByLabelText('タスク名'), '  更新後タスク  ')
    await fireEvent.update(screen.getByLabelText('期限'), '')
    await fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(onEdit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: '更新後タスク',
        dueDate: null,
      }),
    )
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: 'Save' })).not.toBeInTheDocument()
    })
  })

  it('編集保存でエラーが返ると編集モードを維持する', async () => {
    const onEdit = vi.fn().mockResolvedValue([{ field: 'name', reason: 'required' }])
    render(TodoList, {
      props: {
        todos: [BASE_TODO],
        hasSearchCriteria: false,
        onDelete: noopDelete,
        onEdit,
        onToggleCompletion: noopAsync,
      },
    })

    await fireEvent.click(screen.getByRole('button', { name: 'Edit' }))
    await fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(onEdit).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
  })

  it('完了チェック時のエラーを表示する', async () => {
    const onToggleCompletion = vi.fn().mockResolvedValue([
      { field: 'global', reason: '未完了のサブタスクがあります' },
      { field: 'name', reason: 'required' },
    ])

    render(TodoList, {
      props: {
        todos: [BASE_TODO],
        hasSearchCriteria: false,
        onDelete: noopDelete,
        onEdit: noopAsync,
        onToggleCompletion,
      },
    })

    await fireEvent.click(screen.getByRole('checkbox'))

    expect(screen.getByText('未完了のサブタスクがあります')).toBeInTheDocument()
    expect(screen.getByText('入力内容に誤りがあります')).toBeInTheDocument()
  })

  it('サブタスク追加が成功すると入力をクリアする', async () => {
    const onCreateTodo = vi.fn().mockResolvedValue(undefined)
    const parent: Todo = { ...BASE_TODO, id: 10, name: '親タスク', parentId: null }
    const child: Todo = { ...BASE_TODO, id: 11, name: '子タスク', parentId: 10, parentTitle: '親タスク' }

    render(TodoList, {
      props: {
        todos: [parent, child],
        hasSearchCriteria: false,
        onDelete: noopDelete,
        onEdit: noopAsync,
        onToggleCompletion: noopAsync,
        onCreateTodo,
      },
    })

    const input = screen.getByLabelText<HTMLInputElement>('サブタスク名-10')
    await fireEvent.update(input, '  追加サブタスク  ')
    await fireEvent.click(screen.getByRole('button', { name: 'サブタスク追加-10' }))

    expect(onCreateTodo).toHaveBeenCalledWith({
      name: '追加サブタスク',
      detail: '',
      dueDate: null,
      progressStatus: 'not_started',
      recurrenceType: 'none',
      parentId: 10,
    })
    await waitFor(() => {
      expect(input.value).toBe('')
    })
    expect(screen.getAllByText('子タスク').length).toBeGreaterThan(0)
  })

  it('サブタスク追加でエラーが返るとメッセージを表示する', async () => {
    const onCreateTodo = vi.fn().mockResolvedValue([
      { field: 'name', reason: 'required' },
      { field: 'global', reason: 'failed' },
    ])
    const parent: Todo = { ...BASE_TODO, id: 20, name: '親タスク', parentId: null }

    render(TodoList, {
      props: {
        todos: [parent],
        hasSearchCriteria: false,
        onDelete: noopDelete,
        onEdit: noopAsync,
        onToggleCompletion: noopAsync,
        onCreateTodo,
      },
    })

    await fireEvent.click(screen.getByRole('button', { name: 'サブタスク追加-20' }))

    expect(screen.getByText('タスクを追加できませんでした')).toBeInTheDocument()
  })
})
