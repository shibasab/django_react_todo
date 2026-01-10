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
    get: vi.fn(async (url: string) => {
      requests.push({ method: 'GET', url })
      return options.getResponse ?? []
    }),

    post: vi.fn(async (url: string, data?: unknown) => {
      requests.push({ method: 'POST', url, data })
      return options.postResponse ?? {}
    }),

    put: vi.fn(async (url: string, data?: unknown) => {
      requests.push({ method: 'PUT', url, data })
      return options.putResponse ?? {}
    }),

    delete: vi.fn(async (url: string) => {
      requests.push({ method: 'DELETE', url })
      return options.deleteResponse ?? undefined
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
