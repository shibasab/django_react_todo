<script setup lang="ts">
import { reactive, ref } from 'vue'

import type { ValidationError } from '../../models/error'
import type { CreateTodoInput, Todo } from '../../models/todo'
import type { SelectOption } from '../SelectBox.vue'

import { TODO_NAME_MAX_LENGTH, TODO_DETAIL_MAX_LENGTH, useTodoFieldValidation } from '../../composables/useTodo'
import { mergeValidationErrors } from '../../services/validation'
import FieldError from '../FieldError.vue'
import SelectBox from '../SelectBox.vue'
import ValidatedInput from '../ValidatedInput.vue'

const props = defineProps<{
  todos: readonly Todo[]
  hasSearchCriteria: boolean
  onDelete: (id: number) => void
  onEdit: (todo: Todo) => Promise<readonly ValidationError[] | undefined>
  onToggleCompletion: (todo: Todo) => Promise<readonly ValidationError[] | undefined>
  onCreateTodo?: (todo: CreateTodoInput) => Promise<readonly ValidationError[] | undefined>
}>()

type EditState = Todo &
  Readonly<{
    dueDate: string
    errors: readonly ValidationError[]
  }>

const editState = ref<EditState | null>(null)
const childTodoNames = reactive<Record<number, string>>({})
const createTodoErrorsByParentId = reactive<Record<number, readonly ValidationError[]>>({})
const toggleErrors = reactive<Record<number, readonly ValidationError[]>>({})

const emptyMessage = () => (props.hasSearchCriteria ? '条件に一致するタスクがありません' : 'タスクはありません')

const recurrenceTypeLabel: Record<Todo['recurrenceType'], string> = {
  none: 'なし',
  daily: '毎日',
  weekly: '毎週',
  monthly: '毎月',
}

const progressStatusLabel: Record<Todo['progressStatus'], string> = {
  not_started: '着手前',
  in_progress: '進行中',
  completed: '完了',
}

const recurrenceTypeOptions: readonly SelectOption<Todo['recurrenceType']>[] = [
  { value: 'none', label: 'なし' },
  { value: 'daily', label: '毎日' },
  { value: 'weekly', label: '毎週' },
  { value: 'monthly', label: '毎月' },
]

const progressStatusOptions: readonly SelectOption<Todo['progressStatus']>[] = [
  { value: 'not_started', label: '着手前' },
  { value: 'in_progress', label: '進行中' },
  { value: 'completed', label: '完了' },
]

const handleEditClick = (todo: Todo) => {
  editState.value = {
    id: todo.id,
    name: todo.name,
    detail: todo.detail,
    dueDate: todo.dueDate ?? '',
    progressStatus: todo.progressStatus,
    recurrenceType: todo.recurrenceType,
    errors: [],
  }
}

const handleCancelClick = () => {
  editState.value = null
}

const handleInputChange = (field: string, value: string) => {
  if (editState.value == null) return
  editState.value = { ...editState.value, [field]: value }
}

const setEditErrors = (update: (prev: readonly ValidationError[]) => readonly ValidationError[]) => {
  if (editState.value == null) return
  editState.value = { ...editState.value, errors: update(editState.value.errors) }
}

const { validateName, validateDetail } = useTodoFieldValidation(setEditErrors)

const handleSaveClick = async () => {
  if (editState.value == null) return
  const { errors: _, ...todo } = editState.value
  const dueDate = editState.value.dueDate === '' ? null : editState.value.dueDate
  const validationErrors = await props.onEdit({
    ...todo,
    name: todo.name.trim(),
    dueDate,
  })
  if (validationErrors) {
    if (editState.value != null) {
      editState.value = {
        ...editState.value,
        errors: mergeValidationErrors(editState.value.errors, validationErrors),
      }
    }
    return
  }
  editState.value = null
}

const handleChildTodoNameChange = (parentId: number, value: string) => {
  childTodoNames[parentId] = value
}

const handleCreateChildTodo = async (parentId: number) => {
  if (props.onCreateTodo == null) return

  const validationErrors = await props.onCreateTodo({
    name: (childTodoNames[parentId] ?? '').trim(),
    detail: '',
    dueDate: null,
    progressStatus: 'not_started',
    recurrenceType: 'none',
    parentId,
  })

  if (validationErrors != null && validationErrors.length > 0) {
    createTodoErrorsByParentId[parentId] = validationErrors
    return
  }

  childTodoNames[parentId] = ''
  createTodoErrorsByParentId[parentId] = []
}

const handleToggleCompletion = async (todo: Todo) => {
  const errors = await props.onToggleCompletion(todo)
  if (errors == null || errors.length === 0) {
    toggleErrors[todo.id] = []
    return
  }
  toggleErrors[todo.id] = errors
}

const getSubtasks = (todo: Todo): readonly Todo[] => {
  if (todo.parentId != null) return []
  return props.todos.filter((item) => item.parentId === todo.id)
}
</script>

<template>
  <div>
    <br />
    <h4 class="text-xl font-bold mb-4">Todo List</h4>
    <div class="space-y-4">
      <div v-if="todos.length === 0" class="text-center py-8 text-gray-500">{{ emptyMessage() }}</div>
      <template v-for="todo in todos" :key="todo.id">
        <!-- 編集モード -->
        <div v-if="editState?.id === todo.id" class="bg-white rounded-lg shadow-md p-4 border-2 border-blue-400">
          <ValidatedInput
            :id="`edit-name-${todo.id}`"
            name="name"
            type="text"
            label="タスク名"
            error-label="タスク名"
            :model-value="editState.name"
            :max-length="TODO_NAME_MAX_LENGTH"
            :errors="editState.errors"
            :validate="validateName"
            @update:model-value="handleInputChange('name', $event)"
          />
          <ValidatedInput
            :id="`edit-detail-${todo.id}`"
            name="detail"
            type="text"
            label="詳細"
            error-label="詳細"
            :model-value="editState.detail"
            :max-length="TODO_DETAIL_MAX_LENGTH"
            :errors="editState.errors"
            :validate="validateDetail"
            @update:model-value="handleInputChange('detail', $event)"
          />
          <SelectBox
            :id="`edit-recurrenceType-${todo.id}`"
            label="繰り返し"
            :model-value="editState.recurrenceType"
            :options="recurrenceTypeOptions"
            wrapper-class-name="mb-3"
            @update:model-value="handleInputChange('recurrenceType', $event)"
          />
          <SelectBox
            :id="`edit-progressStatus-${todo.id}`"
            label="進捗"
            :model-value="editState.progressStatus"
            :options="progressStatusOptions"
            wrapper-class-name="mb-3"
            @update:model-value="handleInputChange('progressStatus', $event)"
          />
          <div class="mb-3">
            <label :for="`edit-dueDate-${todo.id}`" class="block text-sm font-medium text-gray-700 mb-1"> 期限 </label>
            <input
              :id="`edit-dueDate-${todo.id}`"
              type="date"
              name="dueDate"
              :value="editState.dueDate"
              :class="[
                'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500',
                editState.errors.some((e) => e.field === 'dueDate') ? 'border-red-500' : 'border-gray-300',
              ]"
              @input="handleInputChange('dueDate', ($event.target as HTMLInputElement).value)"
            />
            <FieldError :errors="editState.errors" field-name="dueDate" field-label="期限" />
          </div>
          <div class="flex gap-2">
            <button
              class="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
              @click="handleSaveClick"
            >
              Save
            </button>
            <button
              class="px-3 py-1 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors text-sm"
              @click="handleCancelClick"
            >
              Cancel
            </button>
          </div>
        </div>

        <!-- 表示モード -->
        <div
          v-else
          :class="[
            'rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-200 border border-gray-100 overflow-hidden',
            todo.progressStatus === 'completed' ? 'bg-gray-50' : 'bg-white',
          ]"
        >
          <div class="flex justify-between items-start gap-4">
            <div class="flex items-start gap-3 flex-1 min-w-0">
              <input
                type="checkbox"
                :checked="todo.progressStatus === 'completed'"
                class="mt-1.5 w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300 cursor-pointer"
                @change="handleToggleCompletion(todo)"
              />
              <div class="min-w-0">
                <h5
                  :class="[
                    'text-lg font-semibold break-all overflow-hidden',
                    todo.progressStatus === 'completed' ? 'text-gray-400 line-through' : 'text-gray-800',
                  ]"
                >
                  {{ todo.name }}
                </h5>
                <p :class="['text-sm mt-1', todo.progressStatus === 'completed' ? 'text-gray-400' : 'text-gray-500']">
                  期限: {{ todo.dueDate ?? '-' }}
                </p>
                <p :class="['text-sm mt-1', todo.progressStatus === 'completed' ? 'text-gray-400' : 'text-indigo-700']">
                  進捗: {{ progressStatusLabel[todo.progressStatus] }}
                </p>
                <p
                  v-if="todo.parentId == null"
                  :class="['text-sm mt-1', todo.progressStatus === 'completed' ? 'text-gray-400' : 'text-emerald-700']"
                >
                  サブタスク進捗: {{ todo.completedSubtaskCount ?? 0 }}/{{ todo.totalSubtaskCount ?? 0 }} ({{
                    todo.subtaskProgressPercent ?? 0
                  }}%)
                </p>
                <p
                  v-else
                  :class="['text-sm mt-1', todo.progressStatus === 'completed' ? 'text-gray-400' : 'text-emerald-700']"
                >
                  親タスク: {{ todo.parentTitle ?? '不明' }}
                </p>
                <p
                  v-if="todo.recurrenceType !== 'none'"
                  :class="['text-sm mt-1', todo.progressStatus === 'completed' ? 'text-gray-400' : 'text-cyan-700']"
                >
                  繰り返し: {{ recurrenceTypeLabel[todo.recurrenceType] }}
                </p>
              </div>
            </div>
            <div class="flex gap-2 shrink-0">
              <button
                class="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                @click="handleEditClick(todo)"
              >
                Edit
              </button>
              <button
                class="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
                @click="onDelete(todo.id)"
              >
                Delete
              </button>
            </div>
          </div>
          <div v-if="todo.detail" class="mt-3 pt-3 border-t border-gray-100">
            <p
              :class="[
                'break-all whitespace-pre-wrap overflow-hidden',
                todo.progressStatus === 'completed' ? 'text-gray-400' : 'text-gray-600',
              ]"
            >
              {{ todo.detail }}
            </p>
          </div>
          <!-- サブタスク -->
          <div v-if="todo.parentId == null" class="mt-3 border-t border-gray-100 pt-3">
            <h6 class="text-sm font-semibold text-gray-700">サブタスク</h6>
            <div class="mt-2 flex gap-2">
              <input
                type="text"
                :value="childTodoNames[todo.id] ?? ''"
                :aria-label="`サブタスク名-${todo.id}`"
                placeholder="サブタスク名を入力"
                class="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
                @input="handleChildTodoNameChange(todo.id, ($event.target as HTMLInputElement).value)"
              />
              <button
                type="button"
                :aria-label="`サブタスク追加-${todo.id}`"
                class="rounded-md bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
                @click="handleCreateChildTodo(todo.id)"
              >
                追加
              </button>
            </div>
            <FieldError :errors="createTodoErrorsByParentId[todo.id] ?? []" field-name="name" field-label="タスク名" />
            <p
              v-if="(createTodoErrorsByParentId[todo.id] ?? []).some((error) => error.field !== 'name')"
              class="mt-1 text-sm text-red-600"
            >
              タスクを追加できませんでした
            </p>
            <p v-if="getSubtasks(todo).length === 0" class="mt-2 text-sm text-gray-500">サブタスクはありません</p>
            <ul v-else class="mt-2 list-disc pl-5 text-sm text-gray-700">
              <li v-for="subtask in getSubtasks(todo)" :key="subtask.id">{{ subtask.name }}</li>
            </ul>
          </div>
          <p
            v-for="error in toggleErrors[todo.id] ?? []"
            :key="`${todo.id}-${error.field}-${error.reason}`"
            class="mt-2 text-sm text-red-600"
          >
            {{ error.field === 'global' ? error.reason : '入力内容に誤りがあります' }}
          </p>
        </div>
      </template>
    </div>
  </div>
</template>
