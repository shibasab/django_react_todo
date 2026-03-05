import { fireEvent, render, screen } from '@testing-library/vue'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'

import TodoSearchControls from '../../src/components/todo/todo-search-controls.vue'
import { DEFAULT_TODO_SEARCH_STATE, type TodoSearchState } from '../../src/composables/todoSearch'

describe('TodoSearchControls', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('検索フォームが正しく表示される', () => {
    render(TodoSearchControls, {
      props: { modelValue: DEFAULT_TODO_SEARCH_STATE },
    })

    expect(screen.getByLabelText('検索')).toBeInTheDocument()
    expect(screen.getByLabelText('状態')).toBeInTheDocument()
    expect(screen.getByLabelText('期限')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'クリア' })).toBeInTheDocument()
  })

  it('キーワード入力時にupdate:modelValueをemitする', async () => {
    const result = render(TodoSearchControls, {
      props: { modelValue: DEFAULT_TODO_SEARCH_STATE },
    })

    await fireEvent.update(screen.getByLabelText('検索'), 'テスト')

    const events = result.emitted()['update:modelValue']
    expect(events).toBeTruthy()
    // eslint-disable-next-line typescript/no-unsafe-type-assertion
    const firstEvent = events?.[0] as [TodoSearchState] | undefined
    expect(firstEvent?.[0]?.keyword).toBe('テスト')
  })
})
