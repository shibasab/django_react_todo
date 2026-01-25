import { vi } from 'vitest'

/**
 * localStorage のモックオブジェクト
 */
export const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    }),
  }
})()

// グローバルに localStorage をモックとして設定
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

/**
 * 各テストの前に localStorage をリセットするためのセットアップ
 * beforeEach で呼び出す
 */
export const resetLocalStorageMock = () => {
  localStorageMock.clear()
  vi.clearAllMocks()
}
