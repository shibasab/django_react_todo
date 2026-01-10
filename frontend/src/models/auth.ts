import { User } from './user'

/**
 * 認証APIレスポンス型
 */
export type Auth = Readonly<{
  user: User
  token: string
}>
