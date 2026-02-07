/**
 * TODO型定義
 */
export type Todo = Readonly<{
  id: number
  name: string
  detail: string
  dueDate: string | null
  isCompleted: boolean
}>

export type CreateTodoRequest = Omit<Todo, 'id'>

export type UpdateTodoRequest = Omit<Todo, 'id'>

export type TodoStatusFilter = 'all' | 'completed' | 'incomplete'
export type TodoDueDateFilter = 'all' | 'today' | 'this_week' | 'overdue' | 'none'
