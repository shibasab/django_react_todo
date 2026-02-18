import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import type { ValidationError } from '../../src/models/error'

import { ValidatedInput } from '../../src/components/ValidatedInput'
import { summarizeFormControls, summarizeText } from '../helpers/domSnapshot'

describe('ValidatedInput', () => {
  it('初期表示では通常スタイルで、blur後はバリデーションが実行される', () => {
    const validate = vi.fn<(value: string) => void>()
    const onChange = vi.fn()

    const { container } = render(
      <ValidatedInput
        id="name"
        name="name"
        label="タスク名"
        errorLabel="タスク名"
        value=""
        errors={[]}
        validate={validate}
        onChange={onChange}
      />,
    )

    const input = screen.getByLabelText('タスク名')
    fireEvent.blur(input, { target: { value: 'abc' } })

    expect(validate).toHaveBeenCalledWith('abc')
    expect(summarizeFormControls(container)).toMatchSnapshot('form')
    expect(summarizeText(container)).toMatchSnapshot('text')
  })

  it('エラー時はエラースタイルとエラーメッセージを表示し、touch済みなら入力時にもvalidateする', () => {
    const validate = vi.fn<(value: string) => void>()
    const onChange = vi.fn()
    const errors: readonly ValidationError[] = [{ field: 'name', reason: 'required' }] as const

    const { container } = render(
      <ValidatedInput
        id="name"
        name="name"
        label="タスク名"
        errorLabel="タスク名"
        value=""
        errors={errors}
        validate={validate}
        onChange={onChange}
      />,
    )

    const input = screen.getByLabelText('タスク名')
    fireEvent.blur(input, { target: { value: '' } })
    fireEvent.change(input, { target: { value: 'new value' } })

    expect(validate).toHaveBeenNthCalledWith(1, '')
    expect(validate).toHaveBeenNthCalledWith(2, 'new value')
    expect(summarizeFormControls(container)).toMatchSnapshot('form')
    expect(summarizeText(container)).toMatchSnapshot('text')
  })
})
