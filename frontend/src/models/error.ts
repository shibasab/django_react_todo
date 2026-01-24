/**
 * バリデーションエラー型定義
 * バックエンド (backend/app/schemas/errors.py) と対応
 */

type ValidationErrorBase = Readonly<{
  field: string
  reason: unknown
}>

export type RequiredError = ValidationErrorBase &
  Readonly<{
    reason: 'required'
  }>

export type UniqueViolationError = ValidationErrorBase &
  Readonly<{
    reason: 'unique_violation'
  }>

export type MaxLengthError = ValidationErrorBase &
  Readonly<{
    reason: 'max_length'
    limit: number
  }>

export type MinLengthError = ValidationErrorBase &
  Readonly<{
    reason: 'min_length'
    limit: number
  }>

export type InvalidFormatError = ValidationErrorBase &
  Readonly<{
    reason: 'invalid_format'
  }>

export type ValidationError =
  | RequiredError
  | UniqueViolationError
  | MaxLengthError
  | MinLengthError
  | InvalidFormatError

export type ValidationErrorResponse = Readonly<{
  status: number
  type: 'validation_error'
  errors: readonly ValidationError[]
  detail?: string
}>
