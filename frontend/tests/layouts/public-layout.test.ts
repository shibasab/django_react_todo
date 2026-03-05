import { render, screen } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent, h } from 'vue'

import PublicLayout from '../../src/layouts/public-layout.vue'

type AuthStateMock =
  | { status: 'loading' }
  | { status: 'unauthenticated' }
  | { status: 'authenticated'; user: { id: number; username: string; email: string } }

const authStoreMock: { authState: AuthStateMock } = {
  authState: { status: 'loading' },
}

vi.mock('../../src/stores/auth', () => ({
  useAuthStore: () => authStoreMock,
}))

describe('PublicLayout', () => {
  it('認証状態ロード中はローディング表示を出す', () => {
    authStoreMock.authState = { status: 'loading' }

    render(PublicLayout)

    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('認証状態確定後はslotを表示する', () => {
    authStoreMock.authState = { status: 'authenticated', user: { id: 1, username: 'u', email: 'u@example.com' } }

    render(PublicLayout, {
      slots: {
        default: defineComponent({
          render: () => h('div', 'public slot'),
        }),
      },
    })

    expect(screen.getByText('public slot')).toBeInTheDocument()
  })
})
