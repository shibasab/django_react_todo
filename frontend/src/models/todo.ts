/**
 * TODO型定義
 */
export type TodoRecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly'
export type TodoProgressStatus = 'not_started' | 'in_progress' | 'completed'

export type Todo = Readonly<{
  id: number
  name: string
  detail: string
  dueDate: string | null
  progressStatus: TodoProgressStatus
  recurrenceType: TodoRecurrenceType
}>

export type CreateTodoRequest = Omit<Todo, 'id'>

export type UpdateTodoRequest = Omit<Todo, 'id'>

export type TodoStatusFilter = 'all' | TodoProgressStatus
export type TodoDueDateFilter = 'all' | 'today' | 'this_week' | 'overdue' | 'none'

export type TodoSearchParamStatus = Exclude<TodoStatusFilter, 'all'>
export type TodoSearchParamDueDate = Exclude<TodoDueDateFilter, 'all'>

export type TodoSearchQuery = Readonly<{
  keyword?: string
  progress_status?: TodoSearchParamStatus
  due_date?: TodoSearchParamDueDate
}>
