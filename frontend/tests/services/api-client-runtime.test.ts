import { describe, expect, it, vi } from 'vitest'

import { createApiClient } from '../../src/services/api'

const noop = () => {}

describe('ApiClient runtime error handling', () => {
  it('PUT /todo/:id で409をResult.errとして返す', async () => {
    const fetchImpl: typeof fetch = vi.fn(
      async () =>
        new Response(
          JSON.stringify({
            status: 409,
            type: 'conflict_error',
            detail: '未完了のサブタスクがあるため完了できません',
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

    const result = await apiClient.put('/todo/20/', {
      dueDate: undefined,
      progressStatus: 'completed',
    })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toEqual({
        status: 409,
        type: 'conflict_error',
        detail: '未完了のサブタスクがあるため完了できません',
      })
    }
  })

  it('POST /auth/register で409をResult.errとして返す', async () => {
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

    const result = await apiClient.post('/auth/register', {
      username: 'taken',
      email: 'taken@example.com',
      password: 'password123',
    })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toEqual({
        status: 409,
        type: 'conflict_error',
        detail: 'Username already registered',
      })
    }
  })
})
