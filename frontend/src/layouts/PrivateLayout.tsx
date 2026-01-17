import type { ReactNode } from 'react'

import { Navigate } from 'react-router'

import { useAuth } from '../hooks/useAuth'

type PrivateLayoutProps = Readonly<{
  children: ReactNode
}>

/**
 * 認証必須レイアウト
 * - 未認証: /loginへリダイレクト
 * - 認証済み: childrenを表示
 */
export const PrivateLayout = ({ children }: PrivateLayoutProps) => {
  const { authState } = useAuth()

  switch (authState.status) {
    case 'loading':
      return <div className="flex items-center justify-center min-h-screen text-gray-600">Loading...</div>
    case 'unauthenticated':
      return <Navigate to="/login" replace />
    case 'authenticated':
      return <>{children}</>
  }
}
