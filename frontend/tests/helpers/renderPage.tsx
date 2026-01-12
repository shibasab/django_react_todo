import type { ReactNode } from 'react'

import { render, type RenderResult } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router'

import type { ApiClient } from '../../src/services/api'

import { ApiProvider } from '../../src/contexts/ApiContext'
import { AuthProvider } from '../../src/contexts/AuthContext'
import { Header } from '../../src/layouts/Header'
import { PrivateLayout } from '../../src/layouts/PrivateLayout'
import { PublicLayout } from '../../src/layouts/PublicLayout'
import { DashboardPage } from '../../src/pages/DashboardPage'
import { LoginPage } from '../../src/pages/LoginPage'
import { RegisterPage } from '../../src/pages/RegisterPage'

type RenderPageOptions = Readonly<{
  apiClient: ApiClient
  route?: string
}>

type RenderAppOptions = Readonly<{
  apiClient: ApiClient
  initialRoute: string | null
  isAuthenticated?: boolean
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

/**
 * App全体をテスト用にレンダリング（ルーティング・認証ガード含む）
 * @param isAuthenticated - trueの場合、認証済み状態でレンダリング
 */
export const renderApp = ({
  apiClient,
  initialRoute = '/',
  isAuthenticated = false,
}: RenderAppOptions): RenderResult => {
  // 認証済み状態をシミュレート
  if (isAuthenticated) {
    localStorage.setItem('token', 'mock-token')
  }
  const renderResult = render(
    <ApiProvider client={apiClient}>
      <AuthProvider>
        <MemoryRouter initialEntries={[initialRoute ?? '/']}>
          <Header />
          <div className="container">
            <Routes>
              <Route
                path="/"
                element={
                  <PrivateLayout>
                    <DashboardPage />
                  </PrivateLayout>
                }
              />
              <Route
                path="/login"
                element={
                  <PublicLayout>
                    <LoginPage />
                  </PublicLayout>
                }
              />
              <Route
                path="/register"
                element={
                  <PublicLayout>
                    <RegisterPage />
                  </PublicLayout>
                }
              />
            </Routes>
          </div>
        </MemoryRouter>
      </AuthProvider>
    </ApiProvider>,
  )

  return {
    ...renderResult,
  }
}
