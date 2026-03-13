import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'

import { _setApiClientFactoryForTesting, _clearApiClientFactoryForTesting } from '../../src/stores/api'
import { useAuthStore } from '../../src/stores/auth'
import { setupHttpFixtureTest } from '../helpers/httpMock'
import { resetLocalStorageMock, localStorageMock } from '../helpers/localStorageMock'

describe('useAuthStore', () => {
  beforeEach(() => {
    resetLocalStorageMock()
    _clearApiClientFactoryForTesting()
  })

  it('トークンがなければ未認証状態になる', async () => {
    const { apiClient } = setupHttpFixtureTest()
    _setApiClientFactoryForTesting(() => apiClient)
    setActivePinia(createPinia())

    const authStore = useAuthStore()
    await authStore.loadUser()

    expect(authStore.authState.status).toBe('unauthenticated')
  })

  it('トークンがあり/auth/userが成功すれば認証済みになる', async () => {
    localStorageMock.setItem('token', 'valid-token')

    const { apiClient } = setupHttpFixtureTest({
      routes: [
        {
          method: 'GET',
          url: '/auth/user',
          response: { id: 1, username: 'testuser', email: 'test@example.com' },
        },
      ],
    })
    _setApiClientFactoryForTesting(() => apiClient)
    setActivePinia(createPinia())

    const authStore = useAuthStore()
    await authStore.loadUser()

    expect(authStore.authState.status).toBe('authenticated')
    if (authStore.authState.status === 'authenticated') {
      expect(authStore.authState.user.username).toBe('testuser')
    }
  })

  it('トークンがあり/auth/userが失敗したらトークンを削除して未認証になる', async () => {
    localStorageMock.setItem('token', 'invalid-token')

    const { apiClient } = setupHttpFixtureTest({
      routes: [
        {
          method: 'GET',
          url: '/auth/user',
          status: 401,
          response: { status: 401, type: 'unauthorized', detail: 'Unauthorized' },
        },
      ],
    })
    _setApiClientFactoryForTesting(() => apiClient)
    setActivePinia(createPinia())

    const authStore = useAuthStore()
    await authStore.loadUser()

    expect(localStorageMock.removeItem).toHaveBeenCalledWith('token')
    expect(authStore.authState.status).toBe('unauthenticated')
  })

  it('ログイン成功時にトークンを保存し認証済みになる', async () => {
    const { apiClient } = setupHttpFixtureTest({
      routes: [
        {
          method: 'POST',
          url: '/auth/login',
          response: {
            token: 'new-token',
            user: { id: 1, username: 'testuser', email: 'test@example.com' },
          },
        },
      ],
    })
    _setApiClientFactoryForTesting(() => apiClient)
    setActivePinia(createPinia())

    const authStore = useAuthStore()
    await authStore.login('testuser', 'password')

    expect(localStorageMock.setItem).toHaveBeenCalledWith('token', 'new-token')
    expect(authStore.authState.status).toBe('authenticated')
  })

  it('ログイン失敗時は状態を変更しない', async () => {
    const { apiClient } = setupHttpFixtureTest({
      routes: [
        {
          method: 'POST',
          url: '/auth/login',
          status: 422,
          response: {
            status: 422,
            type: 'validation_error',
            errors: [{ field: 'username', reason: 'required' }],
          },
        },
      ],
    })
    _setApiClientFactoryForTesting(() => apiClient)
    setActivePinia(createPinia())

    const authStore = useAuthStore()
    await authStore.login('', 'password')

    expect(authStore.authState.status).toBe('loading')
  })

  it('ユーザー登録成功時に認証済みになる', async () => {
    const { apiClient } = setupHttpFixtureTest({
      routes: [
        {
          method: 'POST',
          url: '/auth/register',
          response: {
            token: 'new-token',
            user: { id: 1, username: 'testuser', email: 'test@example.com' },
          },
        },
      ],
    })
    _setApiClientFactoryForTesting(() => apiClient)
    setActivePinia(createPinia())

    const authStore = useAuthStore()
    await authStore.register('testuser', 'test@example.com', 'password')

    expect(localStorageMock.setItem).toHaveBeenCalledWith('token', 'new-token')
    expect(authStore.authState.status).toBe('authenticated')
  })

  it('ログアウト時にAPI失敗でもトークンを削除し未認証になる', async () => {
    localStorageMock.setItem('token', 'existing-token')

    const { apiClient } = setupHttpFixtureTest({
      routes: [
        {
          method: 'POST',
          url: '/auth/logout',
          status: 500,
          response: { detail: 'error' },
        },
      ],
    })
    _setApiClientFactoryForTesting(() => apiClient)
    setActivePinia(createPinia())

    const authStore = useAuthStore()
    await expect(authStore.logout()).rejects.toThrow()

    expect(localStorageMock.removeItem).toHaveBeenCalledWith('token')
    expect(authStore.authState.status).toBe('unauthenticated')
  })
})
