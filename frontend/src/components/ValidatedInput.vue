<script setup lang="ts">
import { ref } from 'vue'

import type { ValidationError } from '../models/error'

import FieldError from './FieldError.vue'

const props = defineProps<{
  id: string
  name: string
  label: string
  modelValue: string
  errors: readonly ValidationError[]
  errorLabel: string
  validate: (value: string) => void
  type?: string
  maxLength?: number
  className?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const touched = ref(false)

const handleBlur = (event: Event) => {
  const target = event.target as HTMLInputElement
  touched.value = true
  props.validate(target.value)
}

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
  if (touched.value) {
    props.validate(target.value)
  }
}

const hasError = () => props.errors.some((e) => e.field === props.name)
</script>

<template>
  <div class="mb-4">
    <label :for="id" class="block text-sm font-medium text-gray-700 mb-2">
      {{ label }}
    </label>
    <input
      :id="id"
      :class="[
        'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500',
        hasError() ? 'border-red-500' : 'border-gray-300',
        className ?? '',
      ]"
      :type="type ?? 'text'"
      :maxlength="maxLength"
      :name="name"
      :value="modelValue"
      @input="handleInput"
      @blur="handleBlur"
    />
    <FieldError :errors="errors" :field-name="name" :field-label="errorLabel" />
  </div>
</template>
