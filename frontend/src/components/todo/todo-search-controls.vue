<template>
  <section class="mb-6 rounded-lg border border-gray-100 bg-white p-4 shadow-md">
    <h4 class="mb-3 text-lg font-bold">検索・フィルタ</h4>
    <div class="flex flex-col gap-4 md:flex-row md:items-end">
      <div class="flex-1">
        <label for="todo-search-keyword" class="mb-1 block text-sm font-medium text-gray-700"> 検索 </label>
        <input
          id="todo-search-keyword"
          type="text"
          :value="modelValue.keyword"
          placeholder="タスク名・詳細で検索"
          class="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          @input="handleKeywordChange"
        />
      </div>
      <SelectBox
        id="todo-search-status"
        label="状態"
        :model-value="modelValue.status"
        :options="STATUS_OPTIONS"
        wrapper-class-name="w-full md:w-48"
        @update:model-value="handleStatusChange"
      />
      <SelectBox
        id="todo-search-due-date"
        label="期限"
        :model-value="modelValue.dueDate"
        :options="DUE_DATE_OPTIONS"
        wrapper-class-name="w-full md:w-48"
        @update:model-value="handleDueDateChange"
      />
      <div class="flex w-full md:w-auto">
        <button
          type="button"
          class="w-full rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          @click="handleClear"
        >
          クリア
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { DEFAULT_TODO_SEARCH_STATE, type TodoSearchState } from '../../composables/todoSearch'
import type { TodoDueDateFilter, TodoStatusFilter } from '../../models/todo'
import type { SelectOption } from '../select-box.vue'
import SelectBox from '../select-box.vue'

const STATUS_OPTIONS = [
  { value: 'all', label: 'すべて' },
  { value: 'not_started', label: '着手前' },
  { value: 'in_progress', label: '進行中' },
  { value: 'completed', label: '完了' },
] as const satisfies readonly SelectOption<TodoStatusFilter>[]


const DUE_DATE_OPTIONS = [
  { value: 'all', label: 'すべて' },
  { value: 'today', label: '今日' },
  { value: 'this_week', label: '今週' },
  { value: 'overdue', label: '期限切れ' },
  { value: 'none', label: '期限なし' },
] as const satisfies readonly SelectOption<TodoDueDateFilter>[]


const props = defineProps<{
  modelValue: TodoSearchState
}>()


const emit = defineEmits<{
  'update:modelValue': [value: TodoSearchState]
}>()


const handleKeywordChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', { ...props.modelValue, keyword: target.value })
}


const handleStatusChange = (status: TodoStatusFilter) => {
  emit('update:modelValue', { ...props.modelValue, status })
}


const handleDueDateChange = (dueDate: TodoDueDateFilter) => {
  emit('update:modelValue', { ...props.modelValue, dueDate })
}


const handleClear = () => {
  emit('update:modelValue', DEFAULT_TODO_SEARCH_STATE)
}
</script>
