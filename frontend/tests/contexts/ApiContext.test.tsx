import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import type { ApiClient } from '../../src/services/api'

import { ApiProvider, useApiClient } from '../../src/contexts/ApiContext'
import { summarizeText } from '../helpers/domSnapshot'

const Probe = () => {
  const { isLoading } = useApiClient()
  return <div data-testid="loading-state">{isLoading ? 'loading' : 'idle'}</div>
}

describe('ApiContext', () => {
  it('Provider配下でisLoadingを参照できる', async () => {
    const client = {
      get: vi.fn(async () => []),
      post: vi.fn(async () => ({ ok: true, data: {} })),
      put: vi.fn(async () => ({ ok: true, data: {} })),
      delete: vi.fn(async () => undefined),
    } as unknown as ApiClient

    const { container } = render(
      <ApiProvider client={client}>
        <Probe />
      </ApiProvider>,
    )

    await waitFor(() => {
      expect(screen.getByTestId('loading-state')).toHaveTextContent('idle')
    })
    expect(summarizeText(container)).toMatchSnapshot('text')
  })

  it('Provider外でuseApiClientを使うとエラーになる', () => {
    expect(() => render(<Probe />)).toThrowError('useApiClient must be used within an ApiProvider')
    expect(() => render(<Probe />)).toThrowErrorMatchingSnapshot()
  })
})
