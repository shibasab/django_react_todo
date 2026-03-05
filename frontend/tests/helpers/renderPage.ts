import { render } from '@testing-library/vue'
import { createPinia, setActivePinia } from 'pinia'
import { type Component, defineComponent, h, onMounted } from 'vue'
import { createRouter, createMemoryHistory, RouterView } from 'vue-router'

import type { ApiClient } from '../../src/services/api'

import Header from '../../src/layouts/header.vue'
import { _setApiClientFactoryForTesting, _clearApiClientFactoryForTesting } from '../../src/stores/api'
import { useAuthStore } from '../../src/stores/auth'

type VueRenderResult = ReturnType<typeof render> & { container: HTMLElement }

type RenderPageOptions = Readonly<{
  apiClient: ApiClient
  route?: string
}>

type RenderAppOptions = Readonly<{
  apiClient: ApiClient
  initialRoute: string | null
  isAuthenticated?: boolean
}>

const createTestRouter = (initialRoute: string) => {
  return createRouter({
    history: createMemoryHistory(initialRoute),
    routes: [
      {
        path: '/',
        component: () => import('../../src/pages/dashboard-page.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: '/login',
        component: () => import('../../src/pages/login-page.vue'),
        meta: { guestOnly: true },
      },
      {
        path: '/register',
        component: () => import('../../src/pages/register-page.vue'),
        meta: { guestOnly: true },
      },
    ],
  })
}

const setupAuthGuard = (router: ReturnType<typeof createTestRouter>) => {
  router.beforeEach(async (to) => {
    const authStore = useAuthStore()

    if (authStore.authState.status === 'loading') {
      await new Promise<void>((resolve) => {
        const unwatch = authStore.$subscribe(() => {
          if (authStore.authState.status !== 'loading') {
            unwatch()
            resolve()
          }
        })
      })
    }

    const isAuthenticated = authStore.authState.status === 'authenticated'

    if (to.meta.requiresAuth === true && !isAuthenticated) {
      return '/login'
    }
    if (to.meta.guestOnly === true && isAuthenticated) {
      return '/'
    }
  })
}

export const renderPage = (
  component: Component,
  props: Record<string, unknown>,
  { apiClient, route = '/' }: RenderPageOptions,
): VueRenderResult => {
  _setApiClientFactoryForTesting(() => apiClient)
  const pinia = createPinia()
  setActivePinia(pinia)

  const router = createTestRouter(route)

  // eslint-disable-next-line typescript/no-unsafe-type-assertion
  return render(component, {
    props,
    global: {
      plugins: [pinia, router],
    },
  }) as VueRenderResult
}

export const renderApp = async ({
  apiClient,
  initialRoute = '/',
  isAuthenticated = false,
}: RenderAppOptions): Promise<VueRenderResult> => {
  if (isAuthenticated) {
    localStorage.setItem('token', 'mock-token')
  }

  _setApiClientFactoryForTesting(() => apiClient)
  const pinia = createPinia()
  setActivePinia(pinia)

  const router = createTestRouter(initialRoute ?? '/')
  setupAuthGuard(router)

  const authStore = useAuthStore()
  void authStore.loadUser()

  await router.push(initialRoute ?? '/')
  await router.isReady()

  const AppShell = defineComponent({
    setup() {
      const auth = useAuthStore()
      onMounted(() => {
        void auth.loadUser()
      })
      return () => h('div', [h(Header), h('div', { class: 'container' }, [h(RouterView)])])
    },
  })

  // eslint-disable-next-line typescript/no-unsafe-type-assertion
  return render(AppShell, {
    global: {
      plugins: [pinia, router],
    },
  }) as VueRenderResult
}

export const cleanupTestApiClient = (): void => {
  _clearApiClientFactoryForTesting()
}
