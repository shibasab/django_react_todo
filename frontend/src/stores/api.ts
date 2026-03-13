import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { type ApiClient, type ApiClientCallbacks, createApiClient } from '../services/api'

let _clientFactory: (() => ApiClient) | undefined

export const _setApiClientFactoryForTesting = (factory: () => ApiClient): void => {
  _clientFactory = factory
}

export const _clearApiClientFactoryForTesting = (): void => {
  _clientFactory = undefined
}

export const useApiStore = defineStore('api', () => {
  const loadingCount = ref(0)

  const isLoading = computed(() => loadingCount.value > 0)

  const callbacks: ApiClientCallbacks = {
    onRequestStart: () => {
      loadingCount.value++
    },
    onRequestEnd: () => {
      loadingCount.value = Math.max(0, loadingCount.value - 1)
    },
  }

  const apiClient: ApiClient = _clientFactory?.() ?? createApiClient(undefined, callbacks)

  return { apiClient, isLoading }
})
