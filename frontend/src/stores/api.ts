import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { type ApiClient, type ApiClientCallbacks, createApiClient } from '../services/api'

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

  const apiClient: ApiClient = createApiClient(undefined, callbacks)

  return { apiClient, isLoading }
})
