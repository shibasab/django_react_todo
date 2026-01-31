import { useState, type ChangeEvent, type FocusEvent } from 'react'

import type { ValidationError } from '../models/error'

import { FieldError } from './FieldError'

type ValidatedInputProps = Readonly<{
  id: string
  name: string
  label: string
  value: string
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
  errors: readonly ValidationError[] // 全てのエラー（クライアント側+サーバー側）
  errorLabel: string // FieldErrorで使用するラベル
  validate: (value: string) => void
  type?: string
  maxLength?: number
  className?: string
}>

export const ValidatedInput = ({
  id,
  name,
  type = 'text',
  label,
  errorLabel,
  value,
  maxLength,
  errors,
  validate,
  onChange,
  className,
}: ValidatedInputProps) => {
  const [touched, setTouched] = useState(false)

  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    setTouched(true)
    validate(e.target.value)
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e)
    if (touched) {
      validate(e.target.value)
    }
  }

  const hasError = errors.some((e) => e.field === name)

  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <input
        id={id}
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          hasError ? 'border-red-500' : 'border-gray-300'
        } ${className ?? ''}`}
        type={type}
        maxLength={maxLength}
        name={name}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
      />
      <FieldError errors={errors} fieldName={name} fieldLabel={errorLabel} />
    </div>
  )
}
