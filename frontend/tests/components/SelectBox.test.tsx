import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { SelectBox, type SelectOption } from '../../src/components/SelectBox'

type TestValue = 'all' | 'completed'

const OPTIONS: readonly SelectOption<TestValue>[] = [
  { value: 'all', label: 'すべて' },
  { value: 'completed', label: '完了' },
]

describe('SelectBox', () => {
  it('ラベルと選択肢を表示する', () => {
    render(<SelectBox id="test-select" label="状態" value="all" options={OPTIONS} onChange={() => undefined} />)

    expect(screen.getByLabelText('状態')).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'すべて' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: '完了' })).toBeInTheDocument()
  })

  it('選択変更時に値をコールバックへ渡す', () => {
    const onChange = vi.fn<(value: TestValue) => void>()

    render(<SelectBox id="test-select" label="状態" value="all" options={OPTIONS} onChange={onChange} />)

    fireEvent.change(screen.getByLabelText('状態'), {
      target: { value: 'completed' },
    })

    expect(onChange).toHaveBeenCalledWith('completed')
  })
})
