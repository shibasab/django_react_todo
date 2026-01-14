import type { ReactNode } from 'react'

import { Navigate } from 'react-router'

import { useAuth } from '../hooks/useAuth'

type PublicLayoutProps = Readonly<{
  children: ReactNode
}>

/**
 * 公開レイアウト（未認証のみ）
 * - 認証済み: /へリダイレクト
 * - 未認証: childrenを表示
 */
export const PublicLayout = ({ children }: PublicLayoutProps) => {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen text-gray-600">Loading...</div>
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
