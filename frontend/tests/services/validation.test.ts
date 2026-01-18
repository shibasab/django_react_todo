import { describe, it, expect } from 'vitest'

import { validateRequired, validateMaxLength } from '../../src/services/validation'

describe('validateRequired', () => {
  it('空文字列の場合エラーを返す', () => {
    const result = validateRequired('name', '')
    expect(result).toEqual({ field: 'name', reason: 'required' })
  })

  it('空白のみの場合エラーを返す', () => {
    const result = validateRequired('name', '   ')
    expect(result).toEqual({ field: 'name', reason: 'required' })
  })

  it('値がある場合 null を返す', () => {
    const result = validateRequired('name', 'タスク名')
    expect(result).toBeNull()
  })
})

describe('validateMaxLength', () => {
  it('制限を超えた場合エラーを返す', () => {
    const result = validateMaxLength('name', 'a'.repeat(101), 100)
    expect(result).toEqual({ field: 'name', reason: 'max_length', limit: 100 })
  })

  it('制限以内の場合 null を返す', () => {
    const result = validateMaxLength('name', 'a'.repeat(100), 100)
    expect(result).toBeNull()
  })

  it('空文字列の場合 null を返す', () => {
    const result = validateMaxLength('name', '', 100)
    expect(result).toBeNull()
  })
})
