<template>
  <div class="bg-white rounded-lg shadow-md p-6 my-6">
    <h2 class="text-xl font-bold mb-4">Add Todo</h2>
    <form @submit.prevent="handleSubmit">
      <ValidatedInput
        id="todo-name"
        name="name"
        label="Task"
        error-label="タスク名"
        type="text"
        :max-length="TODO_NAME_MAX_LENGTH"
        :model-value="formState.name"
        :errors="errors"
        :validate="validateName"
        @update:model-value="formState.name = $event"
      />
      <ValidatedInput
        id="todo-detail"
        name="detail"
        label="Detail"
        error-label="詳細"
        type="text"
        :max-length="TODO_DETAIL_MAX_LENGTH"
        :model-value="formState.detail"
        :errors="errors"
        :validate="validateDetail"
        @update:model-value="formState.detail = $event"
      />
      <div class="mb-4">
        <label for="todo-recurrenceType" class="block text-sm font-medium text-gray-700 mb-2"> Recurrence </label>
        <select
          id="todo-recurrenceType"
          v-model="formState.recurrenceType"
          name="recurrenceType"
          class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
        >
          <option value="none">なし</option>
          <option value="daily">毎日</option>
          <option value="weekly">毎週</option>
          <option value="monthly">毎月</option>
        </select>
      </div>
      <div class="mb-4">
        <label for="todo-dueDate" class="block text-sm font-medium text-gray-700 mb-2"> Due Date </label>
        <input
          id="todo-dueDate"
          v-model="formState.dueDate"
          :class="[
            'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500',
            errors.some((e) => e.field === 'dueDate') ? 'border-red-500' : 'border-gray-300',
          ]"
          type="date"
          name="dueDate"
        />
        <FieldError :errors="errors" field-name="dueDate" field-label="期限" />
      </div>
      <div class="mb-4">
        <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
          Submit
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'

import { TODO_NAME_MAX_LENGTH, TODO_DETAIL_MAX_LENGTH, useTodoFieldValidation } from '../../composables/useTodo'
import type { ValidationError } from '../../models/error'
import type { CreateTodoInput, TodoRecurrenceType } from '../../models/todo'
import { mergeValidationErrors } from '../../services/validation'
import FieldError from '../field-error.vue'
import ValidatedInput from '../validated-input.vue'

const props = defineProps<{
  onSubmit: (todo: CreateTodoInput) => Promise<readonly ValidationError[] | undefined>
}>()

const formState = reactive({
  name: '',
  detail: '',
  dueDate: '',
  recurrenceType: 'none' as TodoRecurrenceType,
})

const errors = ref<readonly ValidationError[]>([])

const setErrors = (update: (prev: readonly ValidationError[]) => readonly ValidationError[]) => {
  errors.value = update(errors.value)
}

const { validateName, validateDetail } = useTodoFieldValidation(setErrors)

const handleSubmit = async () => {
  const dueDate = formState.dueDate === '' ? null : formState.dueDate
  const validationErrors = await props.onSubmit({
    name: formState.name.trim(),
    detail: formState.detail,
    dueDate,
    progressStatus: 'not_started',
    recurrenceType: formState.recurrenceType,
    parentId: null,
  })
  if (validationErrors != null && validationErrors.length > 0) {
    errors.value = mergeValidationErrors(errors.value, validationErrors)
    return
  }
  formState.name = ''
  formState.detail = ''
  formState.dueDate = ''
  formState.recurrenceType = 'none'
  errors.value = []
}
</script>
