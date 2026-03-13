import { render } from '@testing-library/vue'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, describe, expect, it } from 'vitest'
import { createRouter, createMemoryHistory } from 'vue-router'

import App from '../src/app.vue'
import { _setApiClientFactoryForTesting, _clearApiClientFactoryForTesting } from '../src/stores/api'
import { summarizeText } from './helpers/domSnapshot'
import { setupHttpFixtureTest } from './helpers/httpMock'
import { resetLocalStorageMock } from './helpers/localStorageMock'

describe('App', () => {
  afterEach(() => {
    _clearApiClientFactoryForTesting()
    resetLocalStorageMock()
  })

  it('ルート構成をレンダリングできる', () => {
    const { apiClient } = setupHttpFixtureTest()
    _setApiClientFactoryForTesting(() => apiClient)

    const pinia = createPinia()
    setActivePinia(pinia)

    const router = createRouter({
      history: createMemoryHistory('/login'),
      routes: [
        { path: '/', component: { template: '<div>Dashboard</div>' } },
        { path: '/login', component: { template: '<div>Login</div>' } },
        { path: '/register', component: { template: '<div>Register</div>' } },
      ],
    })

    const { container } = render(App, {
      global: {
        plugins: [pinia, router],
      },
    })

    expect(summarizeText(container)).toMatchSnapshot('text')
  })
})
