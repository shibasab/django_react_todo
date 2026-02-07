import type { Auth } from '../models/auth'
import type { ValidationErrorResponse } from '../models/error'
import type { CreateTodoRequest, Todo, UpdateTodoRequest } from '../models/todo'
import type { User } from '../models/user'

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
    '/todo/': { request: CreateTodoRequest; response: Todo; error: ValidationErrorResponse }
    '/auth/login': { request: LoginRequest; response: Auth }
    '/auth/register': { request: RegisterRequest; response: Auth }
    '/auth/logout': { response: void }
  }
  put: {
    '/todo/{id}/': { request: UpdateTodoRequest; response: Todo; error: ValidationErrorResponse }
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

export type ApiQuery<M extends keyof ApiEndpoints, E extends keyof ApiEndpoints[M]> = ApiEndpoints[M][E] extends {
  query: infer Q
}
  ? Q
  : undefined

export type ApiRequest<M extends keyof ApiEndpoints, E extends keyof ApiEndpoints[M]> = ApiEndpoints[M][E] extends {
  request: infer R
}
  ? R
  : undefined

export type ApiError<M extends keyof ApiEndpoints, E extends keyof ApiEndpoints[M]> = ApiEndpoints[M][E] extends {
  error: infer R
}
  ? R
  : never
