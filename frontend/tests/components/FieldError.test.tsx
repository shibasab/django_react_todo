import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import type { ValidationError } from '../../src/models/error'

import { FieldError } from '../../src/components/FieldError'

const ALL_ERRORS: readonly ValidationError[] = [
  { field: 'name', reason: 'required' },
  { field: 'name', reason: 'unique_violation' },
  { field: 'name', reason: 'max_length', limit: 20 },
  { field: 'name', reason: 'min_length', limit: 3 },
  { field: 'name', reason: 'invalid_format' },
] as const

describe('FieldError', () => {
  it('対象フィールドにエラーがなければ何も表示しない', () => {
    const { container } = render(<FieldError errors={ALL_ERRORS} fieldName="email" fieldLabel="メール" />)

    expect(container.firstChild).toMatchSnapshot()
  })

  it('対象フィールドのエラーメッセージを理由ごとに表示する', () => {
    const { container } = render(<FieldError errors={ALL_ERRORS} fieldName="name" fieldLabel="タスク名" />)

    expect(container).toMatchSnapshot()
  })
})
