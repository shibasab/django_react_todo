import { render, screen } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'

import type { Todo, TodoProgressStatus } from '../../src/models/todo'

import TodoKanbanBoard from '../../src/components/todo/TodoKanbanBoard.vue'

const TODO_LIST: readonly Todo[] = [
  {
    id: 1,
    name: 'Todo 1',
    detail: '詳細1',
    dueDate: '2025-01-01',
    progressStatus: 'not_started',
    recurrenceType: 'none',
  },
  {
    id: 2,
    name: 'Todo 2',
    detail: '',
    dueDate: null,
    progressStatus: 'in_progress',
    recurrenceType: 'none',
  },
  {
    id: 3,
    name: 'Todo 3',
    detail: '',
    dueDate: '2025-02-01',
    progressStatus: 'completed',
    recurrenceType: 'weekly',
  },
]

describe('TodoKanbanBoard', () => {
  it('カラムとカードが正しく表示される', () => {
    const onMoveTodo = vi.fn<(todo: Todo, nextStatus: TodoProgressStatus) => Promise<void>>()
    render(TodoKanbanBoard, {
      props: { todos: TODO_LIST, hasSearchCriteria: false, onMoveTodo },
    })

    expect(screen.getByText('着手前')).toBeInTheDocument()
    expect(screen.getByText('進行中')).toBeInTheDocument()
    expect(screen.getByText('完了')).toBeInTheDocument()
    expect(screen.getByText('Todo 1')).toBeInTheDocument()
    expect(screen.getByText('Todo 2')).toBeInTheDocument()
    expect(screen.getByText('Todo 3')).toBeInTheDocument()
  })

  it('空リストでは空メッセージを表示する', () => {
    const onMoveTodo = vi.fn<(todo: Todo, nextStatus: TodoProgressStatus) => Promise<void>>()
    render(TodoKanbanBoard, {
      props: { todos: [], hasSearchCriteria: false, onMoveTodo },
    })

    expect(screen.getByText('着手前のタスクはありません')).toBeInTheDocument()
    expect(screen.getByText('進行中のタスクはありません')).toBeInTheDocument()
    expect(screen.getByText('完了タスクはありません')).toBeInTheDocument()
  })

  it('検索条件ありの空リストでは検索メッセージを表示する', () => {
    const onMoveTodo = vi.fn<(todo: Todo, nextStatus: TodoProgressStatus) => Promise<void>>()
    render(TodoKanbanBoard, {
      props: { todos: [], hasSearchCriteria: true, onMoveTodo },
    })

    const messages = screen.getAllByText('条件に一致するタスクがありません')
    expect(messages.length).toBe(3)
  })
})
