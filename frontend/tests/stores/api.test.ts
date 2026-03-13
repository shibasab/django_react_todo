import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'

import { useApiStore, _setApiClientFactoryForTesting, _clearApiClientFactoryForTesting } from '../../src/stores/api'
import { setupHttpFixtureTest } from '../helpers/httpMock'

describe('useApiStore', () => {
  beforeEach(() => {
    _clearApiClientFactoryForTesting()
  })

  it('apiClientとisLoadingを提供する', () => {
    const { apiClient } = setupHttpFixtureTest()
    _setApiClientFactoryForTesting(() => apiClient)
    setActivePinia(createPinia())

    const store = useApiStore()

    expect(store.apiClient).toBeDefined()
    expect(store.isLoading).toBe(false)
  })

  it('テスト用クライアントが注入される', () => {
    const { apiClient } = setupHttpFixtureTest()
    _setApiClientFactoryForTesting(() => apiClient)
    setActivePinia(createPinia())

    const store = useApiStore()

    expect(store.apiClient).toBeDefined()
    expect(store.apiClient.get).toBeDefined()
    expect(store.apiClient.post).toBeDefined()
  })
})
