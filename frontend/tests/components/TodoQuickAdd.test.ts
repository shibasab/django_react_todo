import { fireEvent, render, screen, waitFor } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'

import type { ValidationError } from '../../src/models/error'
import type { CreateTodoInput } from '../../src/models/todo'

import TodoQuickAdd from '../../src/components/todo/todo-quick-add.vue'

describe('TodoQuickAdd', () => {
  it('空入力で送信するとエラーを表示する', async () => {
    const onSubmit = vi.fn<(todo: CreateTodoInput) => Promise<readonly ValidationError[] | undefined>>()
    render(TodoQuickAdd, { props: { onSubmit } })

    await fireEvent.click(screen.getByRole('button', { name: '追加' }))

    await waitFor(() => {
      expect(screen.getByText('タスク名を入力してください')).toBeInTheDocument()
    })
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('入力があれば onSubmit を呼びフォームをクリアする', async () => {
    const onSubmit = vi
      .fn<(todo: CreateTodoInput) => Promise<readonly ValidationError[] | undefined>>()
      .mockResolvedValue(undefined)
    render(TodoQuickAdd, { props: { onSubmit } })

    const input = screen.getByLabelText('クイック入力')
    await fireEvent.update(input, 'テストタスク')
    await fireEvent.click(screen.getByRole('button', { name: '追加' }))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ name: 'テストタスク' }))
    })
  })

  it('バリデーションエラーが返されたらエラーを表示する', async () => {
    const errors: readonly ValidationError[] = [{ field: 'name', reason: 'unique_violation' }]
    const onSubmit = vi
      .fn<(todo: CreateTodoInput) => Promise<readonly ValidationError[] | undefined>>()
      .mockResolvedValue(errors)
    render(TodoQuickAdd, { props: { onSubmit } })

    const input = screen.getByLabelText('クイック入力')
    await fireEvent.update(input, 'テスト')
    await fireEvent.click(screen.getByRole('button', { name: '追加' }))

    await waitFor(() => {
      expect(screen.getByText('このタスク名は既に使用されています')).toBeInTheDocument()
    })
  })
})
