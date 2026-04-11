import { describe, expect, it, vi } from 'vitest'

import {
  FetchAbortError,
  FetchHttpError,
  FetchNetworkError,
  createFetchClient,
} from '../../src/services/http/fetch-client'

describe('fetchClient', () => {
  it('queryとJSONを扱える', async () => {
    const fetchImpl: typeof fetch = vi.fn(async (input, init) => {
      expect(String(input)).toContain('/todo/?keyword=abc')
      expect(init?.method).toBe('POST')
      expect(init?.body).toBe(JSON.stringify({ name: 'task' }))

      return new Response(JSON.stringify({ id: 1 }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    })

    const client = createFetchClient({ baseURL: 'http://localhost/api', fetchImpl })
    const response = await client.request<{ id: number }>({
      method: 'POST',
      url: '/todo/',
      query: { keyword: 'abc' },
      body: { name: 'task' },
    })

    expect(response).toEqual({ id: 1 })
  })

  it('HTTPエラーを区別できる', async () => {
    const fetchImpl: typeof fetch = vi.fn(
      async () =>
        new Response(JSON.stringify({ detail: 'invalid' }), {
          status: 422,
          statusText: 'Unprocessable Entity',
          headers: { 'Content-Type': 'application/json' },
        }),
    )

    const client = createFetchClient({ fetchImpl })

    await expect(client.request({ method: 'GET', url: '/todo/' })).rejects.toBeInstanceOf(FetchHttpError)
  })

  it('ネットワークエラーを区別できる', async () => {
    const fetchImpl: typeof fetch = vi.fn(async () => {
      throw new TypeError('Failed to fetch')
    })

    const client = createFetchClient({ fetchImpl })

    await expect(client.request({ method: 'GET', url: '/todo/' })).rejects.toBeInstanceOf(FetchNetworkError)
  })

  it('Abortエラーを区別できる', async () => {
    const fetchImpl: typeof fetch = vi.fn(async () => {
      throw new DOMException('Aborted', 'AbortError')
    })

    const client = createFetchClient({ fetchImpl })

    await expect(client.request({ method: 'GET', url: '/todo/' })).rejects.toBeInstanceOf(FetchAbortError)
  })
})
