import type { TodoDueDateFilter, TodoStatusFilter } from '../models/todo'

export type TodoSearchState = Readonly<{
  keyword: string
  status: TodoStatusFilter
  dueDate: TodoDueDateFilter
}>

export type TodoSearchParamStatus = Exclude<TodoStatusFilter, 'all'>
export type TodoSearchParamDueDate = Exclude<TodoDueDateFilter, 'all'>

export type TodoSearchParams = Readonly<{
  keyword?: string
  status?: TodoSearchParamStatus
  due_date?: TodoSearchParamDueDate
}>

export const DEFAULT_TODO_SEARCH_STATE: TodoSearchState = {
  keyword: '',
  status: 'all',
  dueDate: 'all',
}
