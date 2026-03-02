import { fireEvent, render, screen } from '@testing-library/vue'
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
}

const TODO_LIST: readonly Todo[] = [
  BASE_TODO,
  { ...BASE_TODO, id: 2, name: 'Todo 2', progressStatus: 'completed', detail: '' },
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

  it('Editボタンで編集モードに切り替わる', async () => {
    render(TodoList, {
      props: {
        todos: [BASE_TODO],
        hasSearchCriteria: false,
        onDelete: noopDelete,
        onEdit: noopAsync,
        onToggleCompletion: noopAsync,
      },
    })

    await fireEvent.click(screen.getByRole('button', { name: 'Edit' }))

    expect(screen.getByLabelText('タスク名')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
  })
})
