import { Fragment, useState, type ChangeEvent } from 'react'

import type { ValidationError } from '../../models/error'
import type { Todo } from '../../models/todo'

import { TODO_NAME_MAX_LENGTH, TODO_DETAIL_MAX_LENGTH } from '../../hooks/useTodo'
import { FieldError } from '../FieldError'

type TodoListProps = Readonly<{
  todos: readonly Todo[]
  onDelete: (id: number) => void
  onEdit: (
    id: number,
    name: string,
    detail: string,
    dueDate: string | null,
    isCompleted: boolean,
  ) => Promise<readonly ValidationError[] | undefined>
  onToggleCompletion: (todo: Todo) => Promise<void>
}>

type EditState = Readonly<{
  id: number
  name: string
  detail: string
  dueDate: string
  isCompleted: boolean
  errors: readonly ValidationError[]
}> | null

export const TodoList = ({ todos, onDelete, onEdit, onToggleCompletion }: TodoListProps) => {
  const [editState, setEditState] = useState<EditState>(null)

  const handleEditClick = (todo: Todo) => {
    setEditState({
      id: todo.id,
      name: todo.name,
      detail: todo.detail,
      dueDate: todo.dueDate ?? '',
      isCompleted: todo.isCompleted,
      errors: [],
    })
  }

  const handleCancelClick = () => {
    setEditState(null)
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (editState == null) return
    const { name, value } = e.target
    setEditState({ ...editState, [name]: value })
  }

  const handleSaveClick = async () => {
    if (editState == null) return
    const dueDate = editState.dueDate === '' ? null : editState.dueDate
    const validationErrors = await onEdit(
      editState.id,
      editState.name.trim(),
      editState.detail,
      dueDate,
      editState.isCompleted,
    )
    if (validationErrors) {
      setEditState({ ...editState, errors: validationErrors })
      return
    }
    setEditState(null)
  }

  return (
    <Fragment>
      <br />
      <h4 className="text-xl font-bold mb-4">Todo List</h4>
      <div className="space-y-4">
        {todos.length === 0 ? (
          <div className="text-center py-8 text-gray-500">タスクはありません</div>
        ) : (
          todos.map((todo) => {
            const isEditing = editState?.id === todo.id

            if (isEditing) {
              return (
                <div key={todo.id} className="bg-white rounded-lg shadow-md p-4 border-2 border-blue-400">
                  <div className="mb-3">
                    <label htmlFor={`edit-name-${todo.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                      タスク名
                    </label>
                    <input
                      id={`edit-name-${todo.id}`}
                      type="text"
                      maxLength={TODO_NAME_MAX_LENGTH}
                      name="name"
                      value={editState.name}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        editState.errors.some((e) => e.field === 'name') ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    <FieldError errors={editState.errors} fieldName="name" fieldLabel="タスク名" />
                  </div>
                  <div className="mb-3">
                    <label htmlFor={`edit-detail-${todo.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                      詳細
                    </label>
                    <input
                      id={`edit-detail-${todo.id}`}
                      type="text"
                      maxLength={TODO_DETAIL_MAX_LENGTH}
                      name="detail"
                      value={editState.detail}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        editState.errors.some((e) => e.field === 'detail') ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    <FieldError errors={editState.errors} fieldName="detail" fieldLabel="詳細" />
                  </div>
                  <div className="mb-3">
                    <label htmlFor={`edit-dueDate-${todo.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                      期限
                    </label>
                    <input
                      id={`edit-dueDate-${todo.id}`}
                      type="date"
                      name="dueDate"
                      value={editState.dueDate}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        editState.errors.some((e) => e.field === 'dueDate') ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    <FieldError errors={editState.errors} fieldName="dueDate" fieldLabel="期限" />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveClick}
                      className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancelClick}
                      className="px-3 py-1 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )
            }

            return (
              <div
                key={todo.id}
                className={`rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-200 border border-gray-100 overflow-hidden ${
                  todo.isCompleted ? 'bg-gray-50' : 'bg-white'
                }`}
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <input
                      type="checkbox"
                      checked={todo.isCompleted}
                      onChange={() => onToggleCompletion(todo)}
                      className="mt-1.5 w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300 cursor-pointer"
                    />
                    <div className="min-w-0">
                      <h5
                        className={`text-lg font-semibold break-all overflow-hidden ${
                          todo.isCompleted ? 'text-gray-400 line-through' : 'text-gray-800'
                        }`}
                      >
                        {todo.name}
                      </h5>
                      <p className={`text-sm mt-1 ${todo.isCompleted ? 'text-gray-400' : 'text-gray-500'}`}>
                        期限: {todo.dueDate ?? '-'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => handleEditClick(todo)}
                      className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(todo.id)}
                      className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                {todo.detail && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p
                      className={`break-all whitespace-pre-wrap overflow-hidden ${
                        todo.isCompleted ? 'text-gray-400' : 'text-gray-600'
                      }`}
                    >
                      {todo.detail}
                    </p>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </Fragment>
  )
}
