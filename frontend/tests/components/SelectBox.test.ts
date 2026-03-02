import { fireEvent, render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import SelectBox, { type SelectOption } from '../../src/components/SelectBox.vue'

type TestValue = 'all' | 'completed'

const OPTIONS: readonly SelectOption<TestValue>[] = [
  { value: 'all', label: 'すべて' },
  { value: 'completed', label: '完了' },
]

describe('SelectBox', () => {
  it('ラベルと選択肢を表示する', () => {
    render(SelectBox, {
      props: { id: 'test-select', label: '状態', modelValue: 'all', options: OPTIONS },
    })

    expect(screen.getByLabelText('状態')).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'すべて' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: '完了' })).toBeInTheDocument()
  })

  it('選択変更時に値をemitする', async () => {
    const result = render(SelectBox, {
      props: { id: 'test-select', label: '状態', modelValue: 'all', options: OPTIONS },
    })

    await fireEvent.update(screen.getByLabelText('状態'), 'completed')

    const events = result.emitted()['update:modelValue']
    expect(events).toBeTruthy()
    expect(events?.[0]).toEqual(['completed'])
  })
})
