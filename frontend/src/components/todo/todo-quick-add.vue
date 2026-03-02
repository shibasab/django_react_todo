<template>
  <section class="mb-6 rounded-lg border border-cyan-100 bg-white p-4 shadow-md">
    <h4 class="mb-3 text-lg font-bold">クイック追加</h4>
    <form class="flex flex-col gap-3 md:flex-row md:items-start" @submit.prevent="handleSubmit">
      <div class="flex-1">
        <label for="todo-quick-add-input" class="mb-1 block text-sm font-medium text-gray-700"> クイック入力 </label>
        <input
          id="todo-quick-add-input"
          type="text"
          name="quickAdd"
          :maxlength="TODO_NAME_MAX_LENGTH"
          :value="input"
          placeholder="例: 来週金曜 リリース準備"
          :class="[
            'w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500',
            errors.some((error) => error.field === 'name' || error.field === 'dueDate')
              ? 'border-red-500'
              : 'border-gray-300',
          ]"
          @input="handleInput"
        />
        <FieldError :errors="errors" field-name="name" field-label="タスク名" />
        <FieldError :errors="errors" field-name="dueDate" field-label="期限" />
      </div>
      <button
        type="submit"
        class="w-full rounded-md bg-cyan-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-cyan-700 md:mt-7 md:w-auto"
      >
        追加
      </button>
    </form>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import type { ValidationError } from '../../models/error'
import type { CreateTodoInput } from '../../models/todo'

import { TODO_NAME_MAX_LENGTH } from '../../composables/useTodo'
import { parseTodoQuickAddInput } from '../../services/todoQuickAddParser'
import { mergeValidationErrors } from '../../services/validation'
import FieldError from '../field-error.vue'

const props = defineProps<{
  onSubmit: (todo: CreateTodoInput) => Promise<readonly ValidationError[] | undefined>
}>()

const input = ref('')
const errors = ref<readonly ValidationError[]>([])

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  input.value = target.value
  errors.value = errors.value.filter((error) => error.field !== 'name' && error.field !== 'dueDate')
}

const handleSubmit = async () => {
  const trimmedInput = input.value.trim()
  if (trimmedInput === '') {
    errors.value = [{ field: 'name', reason: 'required' }]
    return
  }

  const parsed = parseTodoQuickAddInput(trimmedInput)
  const validationErrors = await props.onSubmit({
    name: parsed.name,
    detail: '',
    dueDate: parsed.dueDate,
    progressStatus: 'not_started',
    recurrenceType: 'none',
    parentId: null,
  })
  if (validationErrors != null && validationErrors.length > 0) {
    errors.value = mergeValidationErrors(errors.value, validationErrors)
    return
  }

  input.value = ''
  errors.value = []
}
</script>
