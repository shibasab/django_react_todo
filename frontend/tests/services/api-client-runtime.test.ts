import { describe, expect, it, vi } from 'vitest'

import { createApiClient } from '../../src/services/api'

const noop = () => {}

describe('ApiClient runtime error handling', () => {
  it('POST /auth/register で422をResult.errとして返す', async () => {
    const fetchImpl: typeof fetch = vi.fn(
      async () =>
        new Response(
          JSON.stringify({
            status: 422,
            type: 'validation_error',
            detail: 'email is invalid',
          }),
          {
            status: 422,
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
      username: 'user',
      email: 'invalid-mail',
      password: 'password123',
    })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toEqual({
        status: 422,
        type: 'validation_error',
        detail: 'email is invalid',
      })
    }
  })

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

  it('PUT /todo/:id で500は例外送出する', async () => {
    const fetchImpl: typeof fetch = vi.fn(
      async () =>
        new Response(JSON.stringify({ detail: 'internal error' }), {
          status: 500,
          statusText: 'Internal Server Error',
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

    await expect(
      apiClient.put('/todo/20/', {
        dueDate: undefined,
        progressStatus: 'completed',
      }),
    ).rejects.toMatchObject({ status: 500 })
  })
})
