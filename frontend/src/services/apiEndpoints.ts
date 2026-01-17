import type { Auth } from '../models/auth'
import type { Todo } from '../models/todo'
import type { User } from '../models/user'

export type CreateTodoRequest = Readonly<{
  name: string
  detail: string
}>

export type UpdateTodoRequest = Readonly<{
  name: string
  detail: string
}>

export type LoginRequest = Readonly<{
  username: string
  password: string
}>

export type RegisterRequest = Readonly<{
  username: string
  email: string
  password: string
}>

export type ApiEndpoints = {
  get: {
    '/todo/': { response: readonly Todo[] }
    '/auth/user': { response: User }
  }
  post: {
    '/todo/': { request: CreateTodoRequest; response: Todo }
    '/auth/login': { request: LoginRequest; response: Auth }
    '/auth/register': { request: RegisterRequest; response: Auth }
    '/auth/logout': { response: void }
  }
  put: {
    '/todo/{id}/': { request: UpdateTodoRequest; response: Todo }
  }
  delete: {
    '/todo/{id}/': { response: void }
  }
}

export type GetEndpoints = keyof ApiEndpoints['get']
export type PostEndpoints = keyof ApiEndpoints['post']
export type PutEndpoints = keyof ApiEndpoints['put']
export type DeleteEndpoints = keyof ApiEndpoints['delete']

export type ApiResponse<M extends keyof ApiEndpoints, E extends keyof ApiEndpoints[M]> = ApiEndpoints[M][E] extends {
  response: infer R
}
  ? R
  : never

export type ApiRequest<M extends keyof ApiEndpoints, E extends keyof ApiEndpoints[M]> = ApiEndpoints[M][E] extends {
  request: infer R
}
  ? R
  : undefined
