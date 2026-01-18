import type { ValidationError } from '../models/error'

type Props = Readonly<{
  errors: readonly ValidationError[]
  fieldName: string
  fieldLabel: string
}>

const toErrorMessage = (error: ValidationError, fieldLabel: string): string => {
  switch (error.reason) {
    case 'required':
      return `${fieldLabel}を入力してください`
    case 'unique_violation':
      return `この${fieldLabel}は既に使用されています`
    case 'max_length':
      return `${fieldLabel}は${error.limit}文字以内で入力してください`
    case 'min_length':
      return `${fieldLabel}は${error.limit}文字以上で入力してください`
    default: {
      const exhaustiveCheck: never = error.reason
      throw new Error(`Not Exhaustive: ${exhaustiveCheck}`)
    }
  }
}

export const FieldError = ({ errors, fieldName, fieldLabel }: Props): React.ReactNode => {
  const fieldErrors = errors.filter((error) => error.field === fieldName)

  if (fieldErrors.length === 0) {
    return null
  }

  return (
    <div className="mt-1 text-sm text-red-600">
      {fieldErrors.map((error, index) => (
        <p key={error.reason + index}>{toErrorMessage(error, fieldLabel)}</p>
      ))}
    </div>
  )
}
