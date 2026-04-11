import type {
  AuthResponse,
  ConflictErrorResponse,
  DetailErrorResponse,
  Todo,
  ValidationErrorResponse,
} from '@todoapp/shared'
import { todoPath } from '@todoapp/shared'
import { describe, expect, it, vi } from 'vitest'

import type { Result } from '../../src/models/result'
import { createApiClient } from '../../src/services/api'

type IsEqual<A, B> = (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false

type IsAssignable<From, To> = From extends To ? true : false

type AssertTrue<T extends true> = T

const noop = () => {}

describe('ApiClient typing', () => {
  it('todoPath経由のPUTで契約型が推論される', async () => {
    const fetchImpl: typeof fetch = vi.fn(
      async () =>
        new Response(
          JSON.stringify({
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
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          },
        ),
    )

    const apiClient = createApiClient(
      { fetchImpl },
      {
        onRequestStart: noop,
        onRequestEnd: noop,
      },
    )

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
  })

  it('POST /auth/logout はリクエストボディ不要で契約型が推論される', async () => {
    const fetchImpl: typeof fetch = vi.fn(
      async () =>
        new Response(JSON.stringify({ detail: 'Successfully logged out' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
    )

    const apiClient = createApiClient(
      { fetchImpl },
      {
        onRequestStart: noop,
        onRequestEnd: noop,
      },
    )

    const resultPromise = apiClient.post('/auth/logout')

    type _assertLogout = AssertTrue<IsEqual<typeof resultPromise, Promise<Result<DetailErrorResponse, never>>>>

    const result = await resultPromise
    expect(result.ok).toBe(true)

    const assertLogout: _assertLogout = true
    void assertLogout
  })

  it('POST /auth/register のエラー契約に409 conflictが含まれる', async () => {
    const fetchImpl: typeof fetch = vi.fn(
      async () =>
        new Response(
          JSON.stringify({
            status: 409,
            type: 'conflict_error',
            detail: 'Username already registered',
          }),
          {
            status: 409,
            headers: { 'Content-Type': 'application/json' },
          },
        ),
    )

    const apiClient = createApiClient(
      { fetchImpl },
      {
        onRequestStart: noop,
        onRequestEnd: noop,
      },
    )

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
  })
})
