import type { TodoDueDateFilter, TodoSearchQuery, TodoStatusFilter } from '../models/todo'

export type TodoSearchState = Readonly<{
  keyword: string
  status: TodoStatusFilter
  dueDate: TodoDueDateFilter
}>

export type TodoSearchParams = TodoSearchQuery

export const DEFAULT_TODO_SEARCH_STATE: TodoSearchState = {
  keyword: '',
  status: 'all',
  dueDate: 'all',
}

export const hasSearchCriteria = (state: TodoSearchState): boolean =>
  state.keyword.trim() !== '' || state.status !== 'all' || state.dueDate !== 'all'
