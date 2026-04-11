import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { ApiClientCallbacks } from '../../src/services/api'

const createApiClientMock = vi.fn()

vi.mock('../../src/services/api', () => ({
  createApiClient: createApiClientMock,
}))

describe('useApiStore loading behavior', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('createApiClientへ渡したcallbacksでisLoadingが増減する', async () => {
    let callbacks: ApiClientCallbacks | undefined
    createApiClientMock.mockImplementation((_options: unknown, c: ApiClientCallbacks) => {
      callbacks = c
      return {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
      }
    })

    const { _clearApiClientFactoryForTesting, useApiStore } = await import('../../src/stores/api')

    _clearApiClientFactoryForTesting()
    setActivePinia(createPinia())
    const store = useApiStore()

    expect(createApiClientMock).toHaveBeenCalledTimes(1)
    expect(store.isLoading).toBe(false)

    callbacks?.onRequestStart()
    expect(store.isLoading).toBe(true)

    callbacks?.onRequestEnd()
    expect(store.isLoading).toBe(false)

    callbacks?.onRequestEnd()
    expect(store.isLoading).toBe(false)
  })
})
