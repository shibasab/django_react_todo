import { render, screen } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent, h } from 'vue'

import PrivateLayout from '../../src/layouts/private-layout.vue'

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

describe('PrivateLayout', () => {
  it('認証状態ロード中はローディング表示を出す', () => {
    authStoreMock.authState = { status: 'loading' }

    render(PrivateLayout)

    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('認証状態確定後はslotを表示する', () => {
    authStoreMock.authState = { status: 'unauthenticated' }

    render(PrivateLayout, {
      slots: {
        default: defineComponent({
          render: () => h('div', 'slot content'),
        }),
      },
    })

    expect(screen.getByText('slot content')).toBeInTheDocument()
  })
})
