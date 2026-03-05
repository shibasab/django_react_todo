import { describe, expect, it } from 'vitest'

import { DEFAULT_TODO_SEARCH_STATE, hasSearchCriteria } from '../../src/hooks/todoSearch'

describe('todoSearch hook', () => {
  it('初期状態は検索条件なし', () => {
    expect(hasSearchCriteria(DEFAULT_TODO_SEARCH_STATE)).toBe(false)
  })

  it('キーワード・状態・期限のいずれかが指定されると検索条件あり', () => {
    expect(hasSearchCriteria({ keyword: ' keyword ', status: 'all', dueDate: 'all' })).toBe(true)
    expect(hasSearchCriteria({ keyword: '', status: 'completed', dueDate: 'all' })).toBe(true)
    expect(hasSearchCriteria({ keyword: '', status: 'all', dueDate: 'today' })).toBe(true)
  })
})
