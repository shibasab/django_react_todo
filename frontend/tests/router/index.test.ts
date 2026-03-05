import { beforeEach, describe, expect, it, vi } from 'vitest'

type MockAuthState =
  | { status: 'loading' }
  | { status: 'authenticated'; user: { id: number; username: string; email: string } }
  | { status: 'unauthenticated' }

type MockStore = {
  authState: MockAuthState
  $subscribe: (callback: () => void) => () => void
}

describe('router auth guard', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('未認証で保護ページに遷移すると/loginへリダイレクトされる', async () => {
    const authStore: MockStore = {
      authState: { status: 'unauthenticated' },
      $subscribe: vi.fn(() => () => {}),
    }

    vi.doMock('../../src/stores/auth', () => ({
      useAuthStore: () => authStore,
    }))

    const { default: router } = await import('../../src/router')

    await router.push('/')

    expect(router.currentRoute.value.fullPath).toBe('/login')
  })

  it('認証済みでゲストページに遷移すると/へリダイレクトされる', async () => {
    const authStore: MockStore = {
      authState: {
        status: 'authenticated',
        user: { id: 1, username: 'test', email: 'test@example.com' },
      },
      $subscribe: vi.fn(() => () => {}),
    }

    vi.doMock('../../src/stores/auth', () => ({
      useAuthStore: () => authStore,
    }))

    const { default: router } = await import('../../src/router')

    await router.push('/login')

    expect(router.currentRoute.value.fullPath).toBe('/')
  })

  it('未認証でゲストページへはそのまま遷移できる', async () => {
    const authStore: MockStore = {
      authState: { status: 'unauthenticated' },
      $subscribe: vi.fn(() => () => {}),
    }

    vi.doMock('../../src/stores/auth', () => ({
      useAuthStore: () => authStore,
    }))

    const { default: router } = await import('../../src/router')

    await router.push('/register')

    expect(router.currentRoute.value.fullPath).toBe('/register')
  })
})
