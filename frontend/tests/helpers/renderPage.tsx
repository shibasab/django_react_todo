import type { ReactNode } from 'react'

import { render, type RenderResult } from '@testing-library/react'
import { MemoryRouter } from 'react-router'

import type { ApiClient } from '../../src/services/api'

import { ApiProvider } from '../../src/contexts/ApiContext'
import { AuthProvider } from '../../src/contexts/AuthContext'

type RenderPageOptions = Readonly<{
  apiClient: ApiClient
  route?: string
}>

const contextInjectedNode = (ui: ReactNode, apiClient: ApiClient) => (
  <ApiProvider client={apiClient}>
    <AuthProvider>{ui}</AuthProvider>
  </ApiProvider>
)
/**
 * ページコンポーネントをテスト用にレンダリング
 */
export const renderPage = (ui: ReactNode, { apiClient, route = '/' }: RenderPageOptions): RenderResult => {
  return render(contextInjectedNode(<MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>, apiClient))
}
