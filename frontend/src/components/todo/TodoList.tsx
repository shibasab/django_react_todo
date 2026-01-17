import { Fragment, useState, type ChangeEvent } from 'react'

import type { Todo } from '../../models/todo'

type TodoListProps = Readonly<{
  todos: readonly Todo[]
  onDelete: (id: number) => void
  onEdit: (id: number, name: string, detail: string) => void
}>

type EditState = Readonly<{
  id: number
  name: string
  detail: string
  error: string | null
}> | null

export const TodoList = ({ todos, onDelete, onEdit }: TodoListProps) => {
  const [editState, setEditState] = useState<EditState>(null)

  const handleEditClick = (todo: Todo) => {
    setEditState({ id: todo.id, name: todo.name, detail: todo.detail, error: null })
  }

  const handleCancelClick = () => {
    setEditState(null)
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (editState == null) return
    const { name, value } = e.target
    setEditState({ ...editState, [name]: value, error: null })
  }

  const handleSaveClick = () => {
    if (editState == null) return
    if (editState.name.trim() === '') {
      setEditState({ ...editState, error: 'タスク名は必須です' })
      return
    }
    onEdit(editState.id, editState.name.trim(), editState.detail)
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
                      name="name"
                      value={editState.name}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        editState.error ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {editState.error && <p className="mt-1 text-sm text-red-600">{editState.error}</p>}
                  </div>
                  <div className="mb-3">
                    <label htmlFor={`edit-detail-${todo.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                      詳細
                    </label>
                    <input
                      id={`edit-detail-${todo.id}`}
                      type="text"
                      name="detail"
                      value={editState.detail}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
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
                className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-200 border border-gray-100 overflow-hidden"
              >
                <div className="flex justify-between items-start gap-4">
                  <h5 className="text-lg font-semibold text-gray-800 break-all overflow-hidden flex-1 min-w-0">
                    {todo.name}
                  </h5>
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
                    <p className="text-gray-600 break-all whitespace-pre-wrap overflow-hidden">{todo.detail}</p>
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
