import { User } from './user'

export type Auth = Readonly<{
  user: User
  token: string
}>

// TODO: Tagged Unionを使って状態パターンを列挙し、パラメータの組み合わせを減らす
// 例: { status: 'loading' } | { status: 'authenticated', user: User } | { status: 'unauthenticated' }
export type AuthState = Readonly<{
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}>
