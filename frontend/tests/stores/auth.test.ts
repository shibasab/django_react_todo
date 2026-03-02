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

  it('ログアウト時にトークンを削除し未認証になる', async () => {
    localStorageMock.setItem('token', 'existing-token')

    const { apiClient } = setupHttpFixtureTest({
      routes: [
        {
          method: 'GET',
          url: '/auth/user',
          response: { id: 1, username: 'testuser', email: 'test@example.com' },
        },
        {
          method: 'POST',
          url: '/auth/logout',
          response: null,
        },
      ],
    })
    _setApiClientFactoryForTesting(() => apiClient)
    setActivePinia(createPinia())

    const authStore = useAuthStore()
    await authStore.loadUser()
    expect(authStore.authState.status).toBe('authenticated')

    await authStore.logout()
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('token')
    expect(authStore.authState.status).toBe('unauthenticated')
  })
})
