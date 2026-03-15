import { fireEvent, render, screen } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'

import TodoKanbanBoard from '../../src/components/todo/todo-kanban-board.vue'
import type { Todo, TodoProgressStatus } from '../../src/models/todo'

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

  it('カードを別カラムにドロップするとonMoveTodoを呼ぶ', async () => {
    const onMoveTodo = vi.fn<(todo: Todo, nextStatus: TodoProgressStatus) => Promise<void>>().mockResolvedValue()
    render(TodoKanbanBoard, {
      props: { todos: TODO_LIST, hasSearchCriteria: false, onMoveTodo },
    })

    const card = screen.getByTestId('kanban-card-1')
    const targetColumn = screen.getByTestId('kanban-column-in_progress')
    const setData = vi.fn()

    await fireEvent.dragStart(card, {
      dataTransfer: {
        setData,
        effectAllowed: 'move',
      },
    })
    await fireEvent.drop(targetColumn)

    expect(setData).toHaveBeenCalledWith('text/plain', '1')
    expect(onMoveTodo).toHaveBeenCalledWith(TODO_LIST[0], 'in_progress')
  })

  it('同じステータスへのドロップではonMoveTodoを呼ばない', async () => {
    const onMoveTodo = vi.fn<(todo: Todo, nextStatus: TodoProgressStatus) => Promise<void>>().mockResolvedValue()
    render(TodoKanbanBoard, {
      props: { todos: TODO_LIST, hasSearchCriteria: false, onMoveTodo },
    })

    const card = screen.getByTestId('kanban-card-2')
    const sameColumn = screen.getByTestId('kanban-column-in_progress')

    await fireEvent.dragStart(card, {
      dataTransfer: {
        setData: vi.fn(),
        effectAllowed: 'move',
      },
    })
    await fireEvent.drop(sameColumn)

    expect(onMoveTodo).not.toHaveBeenCalled()
  })
})
