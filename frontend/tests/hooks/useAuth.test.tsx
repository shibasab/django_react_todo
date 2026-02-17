import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { useAuth } from '../../src/hooks/useAuth'

const Probe = () => {
  useAuth()
  return null
}

describe('useAuth', () => {
  it('Provider外で利用するとエラーを投げる', () => {
    expect(() => render(<Probe />)).toThrowError('useAuth must be used within an AuthProvider')
    expect(() => render(<Probe />)).toThrowErrorMatchingSnapshot()
  })
})
