import { vi } from 'vitest'

import type { ApiClient } from '../../src/services/api'

import { ok } from '../../src/models/result'

type ApiRequest = Readonly<{
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  url: string
  data?: unknown
}>

type MockApiClientOptions = Readonly<{
  getResponse?: unknown
  getResponses?: Record<string, unknown> // URL別のGETレスポンス
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
      // URL別レスポンスがあればそれを優先
      if (options.getResponses && url in options.getResponses) {
        return options.getResponses[url] as T
      }
      return (options.getResponse ?? []) as T
    }),

    post: vi.fn(async <T>(url: string, data?: unknown): Promise<T> => {
      requests.push({ method: 'POST', url, data })
      return ok(options.postResponse ?? {}) as unknown as T
    }),

    put: vi.fn(async <T>(url: string, data?: unknown): Promise<T> => {
      requests.push({ method: 'PUT', url, data })
      return ok(options.putResponse ?? {}) as unknown as T
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
