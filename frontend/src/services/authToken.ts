const TOKEN_KEY = 'token'

/**
 * 認証トークンのストレージ管理
 */
export const authToken = {
  get: (): string | null => localStorage.getItem(TOKEN_KEY),
  set: (token: string): void => localStorage.setItem(TOKEN_KEY, token),
  remove: (): void => localStorage.removeItem(TOKEN_KEY),
} as const
