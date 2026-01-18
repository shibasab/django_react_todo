/**
 * クライアントサイドバリデーション（汎用）
 */
import type { RequiredError, MaxLengthError } from '../models/error'

/**
 * 必須チェック
 */
export const validateRequired = (field: string, value: string): RequiredError | null => {
  if (!value.trim()) {
    return { field, reason: 'required' }
  }
  return null
}

/**
 * 最大文字数チェック
 */
export const validateMaxLength = (field: string, value: string, limit: number): MaxLengthError | null => {
  if (value.length > limit) {
    return { field, reason: 'max_length', limit }
  }
  return null
}
