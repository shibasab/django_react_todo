import { defineStore } from 'pinia'
import { ref } from 'vue'

import type { User } from '../models/user'
import { authToken } from '../services/authToken'
import { useApiStore } from './api'

type Loading = Readonly<{ status: 'loading' }>
type Authenticated = Readonly<{ status: 'authenticated'; user: User }>
type Unauthenticated = Readonly<{ status: 'unauthenticated' }>

export type AuthState = Loading | Authenticated | Unauthenticated

export const useAuthStore = defineStore('auth', () => {
  const authState = ref<AuthState>({ status: 'loading' })

  const loadUser = async (): Promise<void> => {
    const { apiClient } = useApiStore()
    const token = authToken.get()
    if (token == null || token === '') {
      authState.value = { status: 'unauthenticated' }
      return
    }

    try {
      const user = await apiClient.get('/auth/user')
      authState.value = { status: 'authenticated', user }
    } catch {
      authToken.remove()
      authState.value = { status: 'unauthenticated' }
    }
  }

  const login = async (username: string, password: string): Promise<void> => {
    const { apiClient } = useApiStore()
    const result = await apiClient.post('/auth/login', { username, password })
    if (!result.ok) {
      return
    }
    authToken.set(result.data.token)
    authState.value = { status: 'authenticated', user: result.data.user }
  }

  const register = async (username: string, email: string, password: string): Promise<void> => {
    const { apiClient } = useApiStore()
    const result = await apiClient.post('/auth/register', { username, email, password })
    if (!result.ok) {
      return
    }
    authToken.set(result.data.token)
    authState.value = { status: 'authenticated', user: result.data.user }
  }

  const logout = async (): Promise<void> => {
    const { apiClient } = useApiStore()
    try {
      await apiClient.post('/auth/logout')
    } finally {
      authToken.remove()
      authState.value = { status: 'unauthenticated' }
    }
  }

  return { authState, loadUser, login, register, logout }
})
