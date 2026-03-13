<template>
  <div v-if="isLoading && todos.length === 0" class="flex items-center justify-center min-h-50 text-gray-600">
    Loading todos...
  </div>
  <template v-else>
    <TodoSearchControls v-model="searchState" />
    <TodoQuickAdd :on-submit="addTodo" />
    <section class="mb-6 rounded-lg border border-gray-100 bg-white p-4 shadow-md">
      <div class="flex gap-2">
        <button
          type="button"
          :class="[
            'rounded-md px-4 py-2 text-sm font-medium transition-colors',
            viewMode === 'list' ? 'bg-blue-600 text-white' : 'border border-gray-300 text-gray-700 hover:bg-gray-50',
          ]"
          @click="viewMode = 'list'"
        >
          一覧表示
        </button>
        <button
          type="button"
          :class="[
            'rounded-md px-4 py-2 text-sm font-medium transition-colors',
            viewMode === 'kanban' ? 'bg-blue-600 text-white' : 'border border-gray-300 text-gray-700 hover:bg-gray-50',
          ]"
          @click="viewMode = 'kanban'"
        >
          カンバン表示
        </button>
      </div>
    </section>
    <section class="mb-6 rounded-lg border border-gray-100 bg-white p-4 shadow-md">
      <button
        type="button"
        :aria-expanded="isDetailFormOpen"
        aria-controls="todo-detail-form-panel"
        class="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
        @click="isDetailFormOpen = !isDetailFormOpen"
      >
        {{ isDetailFormOpen ? '詳細入力を閉じる' : '詳細入力を開く' }}
      </button>
      <div v-if="isDetailFormOpen" id="todo-detail-form-panel">
        <TodoForm :on-submit="addTodo" />
      </div>
    </section>
    <TodoList
      v-if="viewMode === 'list'"
      :todos="todos"
      :has-search-criteria="searchHasCriteria"
      :on-delete="removeTodo"
      :on-edit="updateTodo"
      :on-toggle-completion="toggleTodoCompletion"
      :on-create-todo="addTodo"
    />
    <TodoKanbanBoard v-else :todos="todos" :has-search-criteria="searchHasCriteria" :on-move-todo="handleKanbanMove" />
  </template>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { watchDebounced } from '@vueuse/core'

import type { Todo, TodoProgressStatus } from '../models/todo'

import TodoForm from '../components/todo/todo-form.vue'
import TodoKanbanBoard from '../components/todo/todo-kanban-board.vue'
import TodoList from '../components/todo/todo-list.vue'
import TodoQuickAdd from '../components/todo/todo-quick-add.vue'
import TodoSearchControls from '../components/todo/todo-search-controls.vue'
import { DEFAULT_TODO_SEARCH_STATE, hasSearchCriteria, type TodoSearchState } from '../composables/todoSearch'
import { useTodo } from '../composables/useTodo'

const { todos, isLoading, fetchTodos, addTodo, updateTodo, removeTodo, toggleTodoCompletion } = useTodo()
const searchState = ref<TodoSearchState>(DEFAULT_TODO_SEARCH_STATE)
const isDetailFormOpen = ref(false)
const viewMode = ref<'list' | 'kanban'>('list')
const searchHasCriteria = ref(false)

watch(
  searchState,
  (state) => {
    searchHasCriteria.value = hasSearchCriteria(state)
  },
  { immediate: true, deep: true },
)

watchDebounced(
  searchState,
  (state) => {
    void fetchTodos(state)
  },
  { debounce: 300, immediate: true, deep: true },
)

const handleKanbanMove = async (todo: Todo, nextStatus: TodoProgressStatus) => {
  const validationErrors = await updateTodo({
    ...todo,
    progressStatus: nextStatus,
  })
  if (validationErrors == null) {
    return
  }
  await fetchTodos(searchState.value)
}
</script>
