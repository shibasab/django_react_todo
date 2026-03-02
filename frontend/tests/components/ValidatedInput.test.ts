import { fireEvent, render, screen } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'

import type { ValidationError } from '../../src/models/error'

import ValidatedInput from '../../src/components/ValidatedInput.vue'
import { summarizeFormControls, summarizeText } from '../helpers/domSnapshot'

describe('ValidatedInput', () => {
  it('初期表示では通常スタイルで、blur後はバリデーションが実行される', async () => {
    const validate = vi.fn<(value: string) => void>()

    const { container } = render(ValidatedInput, {
      props: {
        id: 'name',
        name: 'name',
        label: 'タスク名',
        errorLabel: 'タスク名',
        modelValue: '',
        errors: [] as ValidationError[],
        validate,
      },
    })

    const input = screen.getByLabelText('タスク名')
    await fireEvent.blur(input)

    expect(validate).toHaveBeenCalled()
    expect(summarizeFormControls(container)).toMatchSnapshot('form')
    expect(summarizeText(container)).toMatchSnapshot('text')
  })

  it('エラー時はエラースタイルとエラーメッセージを表示する', () => {
    const validate = vi.fn<(value: string) => void>()
    const errors: readonly ValidationError[] = [{ field: 'name', reason: 'required' }] as const

    const { container } = render(ValidatedInput, {
      props: {
        id: 'name',
        name: 'name',
        label: 'タスク名',
        errorLabel: 'タスク名',
        modelValue: '',
        errors,
        validate,
      },
    })

    expect(summarizeFormControls(container)).toMatchSnapshot('form')
    expect(summarizeText(container)).toMatchSnapshot('text')
  })
})
