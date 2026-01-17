import { createContext, useContext, type ReactNode } from 'react'

import { type ApiClient, createApiClient } from '../services/api'

type ApiProviderProps = Readonly<{
  client?: ApiClient
  children: ReactNode
}>

const ApiContext = createContext<ApiClient | null>(null)

/**
 * APIクライアントプロバイダー
 * テスト時にモック用クライアントを注入可能
 */
export const ApiProvider = ({ client, children }: ApiProviderProps) => {
  const apiClient = client ?? createApiClient()
  return <ApiContext.Provider value={apiClient}>{children}</ApiContext.Provider>
}

/**
 * APIクライアントを取得するフック
 */
export const useApiClient = (): ApiClient => {
  const context = useContext(ApiContext)
  if (context == null) {
    throw new Error('useApiClient must be used within an ApiProvider')
  }
  return context
}
