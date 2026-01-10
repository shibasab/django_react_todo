import { vi } from 'vitest'

import type { ApiClient } from '../../src/services/api'

type ApiRequest = Readonly<{
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  url: string
  data?: unknown
}>

type MockApiClientOptions = Readonly<{
  getResponse?: unknown
  postResponse?: unknown
  putResponse?: unknown
  deleteResponse?: unknown
}>

/**
 * テスト用モックAPIクライアントを作成
 * リクエストを記録し、スナップショットで検証可能
 */
export const createMockApiClient = (options: MockApiClientOptions = {}) => {
  const requests: ApiRequest[] = []

  const mockClient = {
    get: vi.fn(async <T>(url: string): Promise<T> => {
      requests.push({ method: 'GET', url })
      return (options.getResponse ?? []) as T
    }),

    post: vi.fn(async <T>(url: string, data?: unknown): Promise<T> => {
      requests.push({ method: 'POST', url, data })
      return (options.postResponse ?? {}) as T
    }),

    put: vi.fn(async <T>(url: string, data?: unknown): Promise<T> => {
      requests.push({ method: 'PUT', url, data })
      return (options.putResponse ?? {}) as T
    }),

    delete: vi.fn(async <T>(url: string): Promise<T> => {
      requests.push({ method: 'DELETE', url })
      return (options.deleteResponse ?? undefined) as T
    }),
  } as ApiClient

  return {
    client: mockClient,
    requests,
    clearRequests: () => {
      requests.length = 0
    },
  }
}
