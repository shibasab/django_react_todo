import { describe, expect, it, vi } from 'vitest'

import { setupHttpFixtureTest } from '../helpers/httpMock'

describe('ApiClient behavior', () => {
  it('GETはparamsをそのままクエリに変換する', async () => {
    const { apiClient, requestLog, restore } = setupHttpFixtureTest({
      routes: [{ method: 'GET', url: '/todo/', status: 200, response: [] }],
    })

    await apiClient.get('/todo/', { keyword: 'abc' })

    expect(requestLog).toHaveLength(1)
    expect(requestLog[0]).toMatchObject({
      method: 'GET',
      url: '/todo/',
      query: { keyword: 'abc' },
    })
    restore()
  })

  it('GETはconfig形式でもparamsを解釈する', async () => {
    const { apiClient, requestLog, restore } = setupHttpFixtureTest({
      routes: [{ method: 'GET', url: '/todo/', status: 200, response: [] }],
    })

    await apiClient.get('/todo/', {
      params: { progressStatus: 'completed' },
      options: { key: 'todo-search', mode: 'latestOnly' },
    })

    expect(requestLog).toHaveLength(1)
    expect(requestLog[0]).toMatchObject({
      method: 'GET',
      url: '/todo/',
      query: { progressStatus: 'completed' },
    })
    restore()
  })

  it('POSTの422はResult.errで返す', async () => {
    const { apiClient, restore } = setupHttpFixtureTest({
      routes: [
        {
          method: 'POST',
          url: '/todo/',
          status: 422,
          response: {
            status: 422,
            type: 'validation_error',
            errors: [{ field: 'name', reason: 'required' }],
          },
        },
      ],
    })

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
    restore()
  })

  it('対象外ステータスのエラーはthrowしつつコールバックを完了させる', async () => {
    const onRequestStart = vi.fn()
    const onRequestEnd = vi.fn()
    const { apiClient, restore } = setupHttpFixtureTest({
      routes: [{ method: 'POST', url: '/auth/register', status: 500, response: { detail: 'server error' } }],
      onRequestStart,
      onRequestEnd,
    })

    await expect(
      apiClient.post('/auth/register', {
        username: 'test',
        email: 'test@example.com',
        password: 'password123',
      }),
    ).rejects.toThrow()

    expect(onRequestStart).toHaveBeenCalledTimes(1)
    expect(onRequestEnd).toHaveBeenCalledTimes(1)
    restore()
  })

  it('latestOnlyでも後続リクエストは解決できる', async () => {
    const abortError = () => Object.assign(new Error('aborted'), { name: 'AbortError' })
    const firstSignalState = { aborted: false }
    let requestCount = 0

    const fetchImpl: typeof fetch = vi.fn(async (_input, init) => {
      requestCount += 1
      const signal = init?.signal

      if (requestCount === 1) {
        return new Promise<Response>((_resolve, reject) => {
          signal?.addEventListener('abort', () => {
            firstSignalState.aborted = signal.aborted
            reject(abortError())
          })
        })
      }

      return new Response(JSON.stringify([]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    })

    const { apiClient, restore } = setupHttpFixtureTest({ fetchImpl })

    const first = apiClient.get('/todo/', {
      params: {},
      options: { key: 'todo-search', mode: 'latestOnly' },
    })
    const firstResult = first.catch((error: unknown) => error)
    const second = apiClient.get('/todo/', {
      params: {},
      options: { key: 'todo-search', mode: 'latestOnly' },
    })

    await expect(second).resolves.toEqual([])
    await expect(firstResult).resolves.toMatchObject({ kind: 'abort' })
    expect(fetchImpl).toHaveBeenCalledTimes(2)
    expect(firstSignalState.aborted).toBe(true)
    restore()
  })

  it('latestOnlyは別keyのGETを中断しない', async () => {
    const fetchImpl: typeof fetch = vi.fn(
      async (_input, init) =>
        new Promise<Response>((resolve, reject) => {
          init?.signal?.addEventListener('abort', () =>
            reject(Object.assign(new Error('aborted'), { name: 'AbortError' })),
          )
          setTimeout(
            () =>
              resolve(
                new Response(JSON.stringify([]), {
                  status: 200,
                  headers: { 'Content-Type': 'application/json' },
                }),
              ),
            0,
          )
        }),
    )

    const { apiClient, restore } = setupHttpFixtureTest({ fetchImpl })

    const first = apiClient.get('/todo/', {
      params: {},
      options: { key: 'todo-search-1', mode: 'latestOnly' },
    })
    const second = apiClient.get('/todo/', {
      params: {},
      options: { key: 'todo-search-2', mode: 'latestOnly' },
    })

    await expect(first).resolves.toEqual([])
    await expect(second).resolves.toEqual([])
    expect(fetchImpl).toHaveBeenCalledTimes(2)
    const [firstCall, secondCall] = vi.mocked(fetchImpl).mock.calls
    expect(firstCall?.[1]?.signal?.aborted).toBe(false)
    expect(secondCall?.[1]?.signal?.aborted).toBe(false)
    restore()
  })

  it('中断後に同一keyで再実行してもcontrollerがリークしない', async () => {
    const abortError = () => Object.assign(new Error('aborted'), { name: 'AbortError' })
    const signals: AbortSignal[] = []

    const fetchImpl: typeof fetch = vi.fn(async (_input, init) => {
      const signal = init?.signal
      if (signal) {
        signals.push(signal)
      }

      if (signals.length === 1) {
        return new Promise<Response>((_resolve, reject) => {
          signal?.addEventListener('abort', () => reject(abortError()))
        })
      }

      return new Response(JSON.stringify([]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    })

    const { apiClient, restore } = setupHttpFixtureTest({ fetchImpl })

    const first = apiClient.get('/todo/', {
      params: {},
      options: { key: 'todo-search', mode: 'latestOnly' },
    })
    const firstResult = first.catch((error: unknown) => error)
    const second = apiClient.get('/todo/', {
      params: {},
      options: { key: 'todo-search', mode: 'latestOnly' },
    })

    await expect(firstResult).resolves.toMatchObject({ kind: 'abort' })
    await expect(second).resolves.toEqual([])

    const secondSignal = signals[1]
    expect(secondSignal?.aborted).toBe(false)

    await expect(
      apiClient.get('/todo/', {
        params: {},
        options: { key: 'todo-search', mode: 'latestOnly' },
      }),
    ).resolves.toEqual([])

    expect(secondSignal?.aborted).toBe(false)
    expect(fetchImpl).toHaveBeenCalledTimes(3)
    restore()
  })
})
