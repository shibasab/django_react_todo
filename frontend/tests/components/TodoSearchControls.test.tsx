import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import type { TodoSearchState } from '../../src/hooks/todoSearch'

import { TodoSearchControls } from '../../src/components/todo/TodoSearchControls'

const initialValue: TodoSearchState = {
  keyword: 'abc',
  status: 'in_progress',
  dueDate: 'today',
}

describe('TodoSearchControls', () => {
  it('キーワード・状態・期限の変更をonChangeへ通知する', () => {
    const onChange = vi.fn<(next: TodoSearchState) => void>()
    const { container } = render(<TodoSearchControls value={initialValue} onChange={onChange} />)

    fireEvent.change(screen.getByLabelText('検索'), { target: { value: 'new keyword' } })
    fireEvent.change(screen.getByLabelText('状態'), { target: { value: 'completed' } })
    fireEvent.change(screen.getByLabelText('期限'), { target: { value: 'none' } })

    expect(onChange).toHaveBeenNthCalledWith(1, { keyword: 'new keyword', status: 'in_progress', dueDate: 'today' })
    expect(onChange).toHaveBeenNthCalledWith(2, { keyword: 'abc', status: 'completed', dueDate: 'today' })
    expect(onChange).toHaveBeenNthCalledWith(3, { keyword: 'abc', status: 'in_progress', dueDate: 'none' })
    expect(container).toMatchSnapshot()
  })

  it('クリアボタンでデフォルト値に戻す', () => {
    const onChange = vi.fn<(next: TodoSearchState) => void>()
    const { container } = render(<TodoSearchControls value={initialValue} onChange={onChange} />)

    fireEvent.click(screen.getByRole('button', { name: 'クリア' }))

    expect(onChange).toHaveBeenCalledWith({ keyword: '', status: 'all', dueDate: 'all' })
    expect(container).toMatchSnapshot()
  })
})
