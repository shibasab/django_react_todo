import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'

import { type ApiClient, createApiClient } from '../services/api'

type ApiContextValue = Readonly<{
  apiClient: ApiClient
  isLoading: boolean
}>

type ApiProviderProps = Readonly<{
  client?: ApiClient
  children: ReactNode
}>

const ApiContext = createContext<ApiContextValue | null>(null)

const useLoadingCounter = () => {
  const [count, setCount] = useState(0)

  const increment = useCallback(() => setCount((prev) => prev + 1), [])
  const decrement = useCallback(() => setCount((prev) => Math.max(0, prev - 1)), [])

  return { isLoading: count > 0, increment, decrement }
}

export const ApiProvider = ({ client, children }: ApiProviderProps) => {
  const { isLoading, increment, decrement } = useLoadingCounter()

  const apiClient = useMemo(
    () =>
      client ??
      createApiClient(undefined, {
        onRequestStart: increment,
        onRequestEnd: decrement,
      }),
    [client, increment, decrement],
  )

  return <ApiContext.Provider value={{ apiClient, isLoading }}>{children}</ApiContext.Provider>
}

/**
 * APIクライアントを取得するフック
 */
export const useApiClient = (): ApiContextValue => {
  const context = useContext(ApiContext)
  if (context == null) {
    throw new Error('useApiClient must be used within an ApiProvider')
  }
  return context
}
