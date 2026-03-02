import { createRouter, createWebHashHistory } from 'vue-router'

import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      component: () => import('../pages/DashboardPage.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/login',
      component: () => import('../pages/LoginPage.vue'),
      meta: { guestOnly: true },
    },
    {
      path: '/register',
      component: () => import('../pages/RegisterPage.vue'),
      meta: { guestOnly: true },
    },
  ],
})

const waitForAuth = async (): Promise<void> => {
  const authStore = useAuthStore()
  if (authStore.authState.status !== 'loading') {
    return
  }
  await new Promise<void>((resolve) => {
    const unwatch = authStore.$subscribe(() => {
      if (authStore.authState.status !== 'loading') {
        unwatch()
        resolve()
      }
    })
  })
}

router.beforeEach(async (to) => {
  await waitForAuth()
  const authStore = useAuthStore()
  const isAuthenticated = authStore.authState.status === 'authenticated'

  if (to.meta.requiresAuth === true && !isAuthenticated) {
    return '/login'
  }
  if (to.meta.guestOnly === true && isAuthenticated) {
    return '/'
  }
})

export default router
