import type {
  AuthResponse,
  ConflictErrorResponse,
  DetailErrorResponse,
  Todo,
  ValidationErrorResponse,
} from '@todoapp/shared'
import { todoPath } from '@todoapp/shared'
import { describe, expect, it } from 'vitest'

import type { Result } from '../../src/models/result'
import { setupHttpFixtureTest } from '../helpers/httpMock'

type IsEqual<A, B> = (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false

type IsAssignable<From, To> = From extends To ? true : false

type AssertTrue<T extends true> = T

describe('ApiClient typing', () => {
  it('todoPath経由のPUTで契約型が推論される', async () => {
    const { apiClient, restore } = setupHttpFixtureTest({
      routes: [
        {
          method: 'PUT',
          url: '/todo/1/',
          status: 200,
          response: {
            id: 1,
            name: 'タスク更新',
            detail: '',
            dueDate: null,
            createdAt: '2026-01-01T00:00:00.000Z',
            progressStatus: 'not_started',
            recurrenceType: 'none',
            parentId: null,
            completedSubtaskCount: 0,
            totalSubtaskCount: 0,
            subtaskProgressPercent: 0,
          },
        },
      ],
    })

    const resultPromise = apiClient.put(todoPath(1), {
      name: 'タスク更新',
      dueDate: undefined,
    })

    type _assertPut = AssertTrue<
      IsAssignable<typeof resultPromise, Promise<Result<Todo, ValidationErrorResponse | ConflictErrorResponse>>>
    >

    const result = await resultPromise
    expect(result.ok).toBe(true)

    const assertPut: _assertPut = true
    void assertPut
    restore()
  })

  it('POST /auth/logout はリクエストボディ不要で契約型が推論される', async () => {
    const { apiClient, restore } = setupHttpFixtureTest({
      routes: [
        {
          method: 'POST',
          url: '/auth/logout',
          status: 200,
          response: { detail: 'Successfully logged out' },
        },
      ],
    })

    const resultPromise = apiClient.post('/auth/logout')

    type _assertLogout = AssertTrue<IsEqual<typeof resultPromise, Promise<Result<DetailErrorResponse, never>>>>

    const result = await resultPromise
    expect(result.ok).toBe(true)

    const assertLogout: _assertLogout = true
    void assertLogout
    restore()
  })

  it('POST /auth/register のエラー契約に409 conflictが含まれる', async () => {
    const { apiClient, restore } = setupHttpFixtureTest({
      routes: [
        {
          method: 'POST',
          url: '/auth/register',
          status: 409,
          response: {
            status: 409,
            type: 'conflict_error',
            detail: 'Username already registered',
          },
        },
      ],
    })

    const resultPromise = apiClient.post('/auth/register', {
      username: 'taken',
      email: 'taken@example.com',
      password: 'password123',
    })

    type _assertRegister = AssertTrue<
      IsAssignable<typeof resultPromise, Promise<Result<AuthResponse, ValidationErrorResponse | ConflictErrorResponse>>>
    >

    const result = await resultPromise
    expect(result.ok).toBe(false)

    const assertRegister: _assertRegister = true
    void assertRegister
    restore()
  })
})
