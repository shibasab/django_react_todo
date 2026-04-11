import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createApiClient } from '../../src/services/api'

type FetchCall = Readonly<{
  url: string
  init?: RequestInit
}>

describe('ApiClient behavior', () => {
  let fetchCalls: FetchCall[] = []

  beforeEach(() => {
    fetchCalls = []
  })

  it('GETはparamsをそのままクエリに変換する', async () => {
    const fetchImpl: typeof fetch = vi.fn(async (input, init) => {
      fetchCalls.push({ url: String(input), init })
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    })

    const apiClient = createApiClient(
      { fetchImpl },
      {
        onRequestStart: () => {},
        onRequestEnd: () => {},
      },
    )

    await apiClient.get('/todo/', { keyword: 'abc' })

    expect(fetchCalls).toHaveLength(1)
    expect(fetchCalls[0]?.url).toContain('/todo/?keyword=abc')
  })

  it('GETはconfig形式でもparamsを解釈する', async () => {
    const fetchImpl: typeof fetch = vi.fn(async (input, init) => {
      fetchCalls.push({ url: String(input), init })
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    })

    const apiClient = createApiClient(
      { fetchImpl },
      {
        onRequestStart: () => {},
        onRequestEnd: () => {},
      },
    )

    await apiClient.get('/todo/', {
      params: { progressStatus: 'completed' },
      options: { key: 'todo-search', mode: 'latestOnly' },
    })

    expect(fetchCalls).toHaveLength(1)
    expect(fetchCalls[0]?.url).toContain('/todo/?progressStatus=completed')
  })

  it('POSTの422はResult.errで返す', async () => {
    const fetchImpl: typeof fetch = vi.fn(
      async () =>
        new Response(
          JSON.stringify({
            status: 422,
            type: 'validation_error',
            errors: [{ field: 'name', reason: 'required' }],
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
        onRequestStart: () => {},
        onRequestEnd: () => {},
      },
    )

    const result = await apiClient.post('/todo/', {
      name: '',
      detail: '',
      dueDate: null,
      progressStatus: 'not_started',
      recurrenceType: 'none',
      parentId: null,
    })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.status).toBe(422)
    }
  })

  it('対象外ステータスのエラーはthrowしつつコールバックを完了させる', async () => {
    const fetchImpl: typeof fetch = vi.fn(
      async () =>
        new Response(JSON.stringify({ detail: 'server error' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }),
    )

    const onRequestStart = vi.fn()
    const onRequestEnd = vi.fn()

    const apiClient = createApiClient(
      { fetchImpl },
      {
        onRequestStart,
        onRequestEnd,
      },
    )

    await expect(
      apiClient.post('/auth/register', {
        username: 'test',
        email: 'test@example.com',
        password: 'password123',
      }),
    ).rejects.toThrow()

    expect(onRequestStart).toHaveBeenCalledTimes(1)
    expect(onRequestEnd).toHaveBeenCalledTimes(1)
  })

  it('latestOnlyでも後続リクエストは解決できる', async () => {
    let firstRequest = true

    const fetchImpl: typeof fetch = vi.fn(async () => {
      if (firstRequest) {
        firstRequest = false
        return new Promise<Response>(() => {})
      }

      return new Response(JSON.stringify([]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    })

    const apiClient = createApiClient(
      { fetchImpl },
      {
        onRequestStart: () => {},
        onRequestEnd: () => {},
      },
    )

    const first = apiClient.get('/todo/', {
      params: {},
      options: { key: 'todo-search', mode: 'latestOnly' },
    })
    const second = apiClient.get('/todo/', {
      params: {},
      options: { key: 'todo-search', mode: 'latestOnly' },
    })

    await expect(second).resolves.toEqual([])
    expect(fetchImpl).toHaveBeenCalledTimes(2)

    first.catch(() => {})
  })
})
