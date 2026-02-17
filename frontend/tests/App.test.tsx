import type { ReactNode } from 'react'

import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import App from '../src/App'

vi.mock('../src/contexts/ApiContext', () => ({
  ApiProvider: ({ children }: { children: ReactNode }) => <div data-testid="api-provider">{children}</div>,
}))

vi.mock('../src/contexts/AuthContext', () => ({
  AuthProvider: ({ children }: { children: ReactNode }) => <div data-testid="auth-provider">{children}</div>,
}))

vi.mock('../src/layouts/Header', () => ({ Header: () => <header>Header</header> }))
vi.mock('../src/layouts/PrivateLayout', () => ({
  PrivateLayout: ({ children }: { children: ReactNode }) => <>{children}</>,
}))
vi.mock('../src/layouts/PublicLayout', () => ({
  PublicLayout: ({ children }: { children: ReactNode }) => <>{children}</>,
}))
vi.mock('../src/pages/DashboardPage', () => ({ DashboardPage: () => <div>DashboardPage</div> }))
vi.mock('../src/pages/LoginPage', () => ({ LoginPage: () => <div>LoginPage</div> }))
vi.mock('../src/pages/RegisterPage', () => ({ RegisterPage: () => <div>RegisterPage</div> }))

describe('App', () => {
  it('ルート構成をレンダリングできる', () => {
    const { container } = render(<App />)
    expect(container).toMatchSnapshot()
  })
})
