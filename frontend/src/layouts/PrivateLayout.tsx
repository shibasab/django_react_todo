import type { ReactNode } from 'react'

import { Redirect } from 'react-router-dom'

import { useAuth } from '../services/auth'

type PrivateLayoutProps = Readonly<{
  children: ReactNode
}>

/**
 * 認証必須レイアウト
 * - 未認証: /loginへリダイレクト
 * - 認証済み: childrenを表示
 */
export const PrivateLayout = ({ children }: PrivateLayoutProps) => {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!isAuthenticated) {
    return <Redirect to="/login" />
  }

  return <>{children}</>
}
