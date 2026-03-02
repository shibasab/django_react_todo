<script setup lang="ts">
import type { ValidationError } from '../models/error'

const props = defineProps<{
  errors: readonly ValidationError[]
  fieldName: string
  fieldLabel: string
}>()

const toErrorMessage = (error: ValidationError, fieldLabel: string): string => {
  const reason = error.reason
  switch (reason) {
    case 'required':
      return `${fieldLabel}を入力してください`
    case 'unique_violation':
      return `この${fieldLabel}は既に使用されています`
    case 'max_length':
      return typeof error.limit === 'number'
        ? `${fieldLabel}は${error.limit}文字以内で入力してください`
        : `${fieldLabel}が長すぎます`
    case 'min_length':
      return typeof error.limit === 'number'
        ? `${fieldLabel}は${error.limit}文字以上で入力してください`
        : `${fieldLabel}が短すぎます`
    case 'invalid_format':
      return `${fieldLabel}の形式が正しくありません`
    default:
      return `${fieldLabel}の入力内容を確認してください`
  }
}

const fieldErrors = () => props.errors.filter((error) => error.field === props.fieldName)
</script>

<template>
  <div v-if="fieldErrors().length > 0" class="mt-1 text-sm text-red-600">
    <p v-for="(error, index) in fieldErrors()" :key="error.reason + index">
      {{ toErrorMessage(error, fieldLabel) }}
    </p>
  </div>
</template>
