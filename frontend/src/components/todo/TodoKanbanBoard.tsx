import { useMemo, useState, type DragEvent } from 'react'

import type { Todo, TodoProgressStatus } from '../../models/todo'

type TodoKanbanBoardProps = Readonly<{
  todos: readonly Todo[]
  hasSearchCriteria: boolean
  onMoveTodo: (todo: Todo, nextStatus: TodoProgressStatus) => Promise<void>
}>

type TodoColumn = Readonly<{
  status: TodoProgressStatus
  title: string
  emptyMessage: string
}>

const TODO_COLUMNS: readonly TodoColumn[] = [
  {
    status: 'not_started',
    title: '着手前',
    emptyMessage: '着手前のタスクはありません',
  },
  {
    status: 'in_progress',
    title: '進行中',
    emptyMessage: '進行中のタスクはありません',
  },
  {
    status: 'completed',
    title: '完了',
    emptyMessage: '完了タスクはありません',
  },
] as const

export const TodoKanbanBoard = ({ todos, hasSearchCriteria, onMoveTodo }: TodoKanbanBoardProps) => {
  const [draggingTodoId, setDraggingTodoId] = useState<number | null>(null)
  const [isMoving, setIsMoving] = useState(false)
  const groupedTodos = useMemo(
    () =>
      TODO_COLUMNS.map((column) => ({
        ...column,
        todos: todos.filter((todo) => todo.progressStatus === column.status),
      })),
    [todos],
  )

  const handleDragStart = (event: DragEvent<HTMLElement>, todo: Todo) => {
    setDraggingTodoId(todo.id)
    event.dataTransfer.setData('text/plain', String(todo.id))
    event.dataTransfer.effectAllowed = 'move'
  }

  const handleDrop = async (nextStatus: TodoProgressStatus) => {
    const todoId = draggingTodoId
    setDraggingTodoId(null)
    if (todoId == null) return

    const target = todos.find((todo) => todo.id === todoId)
    if (target == null || target.progressStatus === nextStatus || isMoving) {
      return
    }

    setIsMoving(true)
    try {
      await onMoveTodo(target, nextStatus)
    } finally {
      setIsMoving(false)
    }
  }

  return (
    <section className="mb-6">
      <h4 className="mb-4 text-xl font-bold">Todo Kanban</h4>
      <div className="grid gap-4 md:grid-cols-3">
        {groupedTodos.map((column) => (
          <section
            key={column.status}
            className="rounded-lg border border-gray-200 bg-gray-50 p-3"
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => void handleDrop(column.status)}
            data-testid={`kanban-column-${column.status}`}
          >
            <header className="mb-3 flex items-center justify-between">
              <h5 className="text-sm font-semibold text-gray-700">{column.title}</h5>
              <span className="rounded-full bg-white px-2 py-0.5 text-xs text-gray-600">{column.todos.length}</span>
            </header>
            <div className="space-y-2">
              {column.todos.length === 0 ? (
                <p className="rounded-md border border-dashed border-gray-300 bg-white px-3 py-4 text-center text-xs text-gray-500">
                  {hasSearchCriteria ? '条件に一致するタスクがありません' : column.emptyMessage}
                </p>
              ) : (
                column.todos.map((todo) => (
                  <article
                    key={todo.id}
                    draggable={!isMoving}
                    onDragStart={(event) => handleDragStart(event, todo)}
                    className="cursor-grab rounded-md border border-gray-200 bg-white p-3 shadow-sm active:cursor-grabbing"
                    data-testid={`kanban-card-${todo.id}`}
                  >
                    <h6 className="text-sm font-semibold text-gray-800">{todo.name}</h6>
                    {todo.detail !== '' ? <p className="mt-1 text-xs text-gray-500">{todo.detail}</p> : null}
                    <p className="mt-2 text-xs text-gray-500">期限: {todo.dueDate ?? '-'}</p>
                  </article>
                ))
              )}
            </div>
          </section>
        ))}
      </div>
    </section>
  )
}
