<script setup lang="ts">
import { computed, ref } from 'vue'

import type { Todo, TodoProgressStatus } from '../../models/todo'

type TodoColumn = Readonly<{
  status: TodoProgressStatus
  title: string
  emptyMessage: string
}>

const TODO_COLUMNS = [
  { status: 'not_started', title: '着手前', emptyMessage: '着手前のタスクはありません' },
  { status: 'in_progress', title: '進行中', emptyMessage: '進行中のタスクはありません' },
  { status: 'completed', title: '完了', emptyMessage: '完了タスクはありません' },
] as const satisfies readonly TodoColumn[]

const props = defineProps<{
  todos: readonly Todo[]
  hasSearchCriteria: boolean
  onMoveTodo: (todo: Todo, nextStatus: TodoProgressStatus) => Promise<void>
}>()

const draggingTodoId = ref<number | null>(null)
const isMoving = ref(false)

const groupedTodos = computed(() =>
  TODO_COLUMNS.map((column) => ({
    ...column,
    todos: props.todos.filter((todo) => todo.progressStatus === column.status),
  })),
)

const handleDragStart = (event: DragEvent, todo: Todo) => {
  draggingTodoId.value = todo.id
  if (event.dataTransfer) {
    event.dataTransfer.setData('text/plain', String(todo.id))
    event.dataTransfer.effectAllowed = 'move'
  }
}

const handleDrop = async (nextStatus: TodoProgressStatus) => {
  const todoId = draggingTodoId.value
  draggingTodoId.value = null
  if (todoId == null) return

  const target = props.todos.find((todo) => todo.id === todoId)
  if (target == null || target.progressStatus === nextStatus || isMoving.value) {
    return
  }

  isMoving.value = true
  try {
    await props.onMoveTodo(target, nextStatus)
  } finally {
    isMoving.value = false
  }
}
</script>

<template>
  <section class="mb-6">
    <h4 class="mb-4 text-xl font-bold">Todo Kanban</h4>
    <div class="grid gap-4 md:grid-cols-3">
      <section
        v-for="column in groupedTodos"
        :key="column.status"
        class="rounded-lg border border-gray-200 bg-gray-50 p-3"
        :data-testid="`kanban-column-${column.status}`"
        @dragover.prevent
        @drop="handleDrop(column.status)"
      >
        <header class="mb-3 flex items-center justify-between">
          <h5 class="text-sm font-semibold text-gray-700">{{ column.title }}</h5>
          <span class="rounded-full bg-white px-2 py-0.5 text-xs text-gray-600">{{ column.todos.length }}</span>
        </header>
        <div class="space-y-2">
          <p
            v-if="column.todos.length === 0"
            class="rounded-md border border-dashed border-gray-300 bg-white px-3 py-4 text-center text-xs text-gray-500"
          >
            {{ hasSearchCriteria ? '条件に一致するタスクがありません' : column.emptyMessage }}
          </p>
          <article
            v-for="todo in column.todos"
            v-else
            :key="todo.id"
            :draggable="!isMoving"
            :data-testid="`kanban-card-${todo.id}`"
            class="cursor-grab rounded-md border border-gray-200 bg-white p-3 shadow-sm active:cursor-grabbing"
            @dragstart="handleDragStart($event, todo)"
          >
            <h6 class="text-sm font-semibold text-gray-800">{{ todo.name }}</h6>
            <p v-if="todo.detail !== ''" class="mt-1 text-xs text-gray-500">{{ todo.detail }}</p>
            <p class="mt-2 text-xs text-gray-500">期限: {{ todo.dueDate ?? '-' }}</p>
          </article>
        </div>
      </section>
    </div>
  </section>
</template>
