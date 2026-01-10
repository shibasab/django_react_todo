import { createContext, useState, useEffect, type ReactNode } from 'react'

import type { User } from '../models/user'

import { type Auth } from '../models/auth'
import { tokenStorage } from '../services/api'
import { useApiClient } from './ApiContext'

/**
 * 認証状態（Context内部用）
 */
type AuthState = Readonly<{
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}>

/**
 * 認証Context の公開API
 */
export type AuthContextValue = Readonly<{
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (username: string, password: string) => Promise<void>
  register: (username: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}>

// 初期状態
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const apiClient = useApiClient()
  const [state, setState] = useState<AuthState>(initialState)

  // 初回マウント時にユーザー情報を読み込む
  useEffect(() => {
    const loadUser = async () => {
      const token = tokenStorage.get()
      if (token == null || token === '') {
        setState({ user: null, isAuthenticated: false, isLoading: false })
        return
      }

      try {
        const user = await apiClient.get<User>('/auth/user')
        setState({ user, isAuthenticated: true, isLoading: false })
      } catch {
        tokenStorage.remove()
        setState({ user: null, isAuthenticated: false, isLoading: false })
      }
    }

    loadUser()
  }, [])

  const login = async (username: string, password: string): Promise<void> => {
    const response = await apiClient.post<Auth>('/auth/login', { username, password })
    tokenStorage.set(response.token)
    setState({ user: response.user, isAuthenticated: true, isLoading: false })
  }

  const register = async (username: string, email: string, password: string): Promise<void> => {
    const response = await apiClient.post<Auth>('/auth/register', { username, email, password })
    tokenStorage.set(response.token)
    setState({ user: response.user, isAuthenticated: true, isLoading: false })
  }

  const logout = async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout', null)
    } finally {
      tokenStorage.remove()
      setState({ user: null, isAuthenticated: false, isLoading: false })
    }
  }

  const value = {
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    login,
    register,
    logout,
  } as const satisfies AuthContextValue

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
