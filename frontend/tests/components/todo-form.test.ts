import { fireEvent, render, screen, waitFor } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'

import type { ValidationError } from '../../src/models/error'
import type { CreateTodoInput } from '../../src/models/todo'

import TodoForm from '../../src/components/todo/todo-form.vue'
import { summarizeFormControls } from '../helpers/domSnapshot'

describe('TodoForm', () => {
  it('フォームが正しく表示される', () => {
    const onSubmit = vi.fn<(todo: CreateTodoInput) => Promise<readonly ValidationError[] | undefined>>()
    const { container } = render(TodoForm, { props: { onSubmit } })

    expect(summarizeFormControls(container)).toMatchSnapshot('initial-form')
  })

  it('入力してSubmitするとonSubmitが呼ばれフォームがリセットされる', async () => {
    const onSubmit = vi
      .fn<(todo: CreateTodoInput) => Promise<readonly ValidationError[] | undefined>>()
      .mockResolvedValue(undefined)
    render(TodoForm, { props: { onSubmit } })

    await fireEvent.update(screen.getByLabelText('Task'), 'テストタスク')
    await fireEvent.update(screen.getByLabelText('Detail'), '詳細テスト')
    await fireEvent.click(screen.getByRole('button', { name: 'Submit' }))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'テストタスク',
          detail: '詳細テスト',
          progressStatus: 'not_started',
          recurrenceType: 'none',
        }),
      )
    })
  })
})
