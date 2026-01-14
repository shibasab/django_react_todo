import { Fragment } from 'react'

import type { Todo } from '../../models/todo'

type TodoListProps = Readonly<{
  todos: readonly Todo[]
  onDelete: (id: number) => void
}>

export const TodoList = ({ todos, onDelete }: TodoListProps) => {
  return (
    <Fragment>
      <br />
      <h4 className="text-xl font-bold mb-4">Todo List</h4>
      <div className="space-y-4">
        {todos.length === 0 ? (
          <div className="text-center py-8 text-gray-500">タスクはありません</div>
        ) : (
          todos.map((todo) => (
            <div
              key={todo.id}
              className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-200 border border-gray-100 overflow-hidden"
            >
              <div className="flex justify-between items-start gap-4">
                <h5 className="text-lg font-semibold text-gray-800 break-all overflow-hidden flex-1 min-w-0">
                  {todo.name}
                </h5>
                <button
                  onClick={() => onDelete(todo.id)}
                  className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm shrink-0"
                >
                  Delete
                </button>
              </div>
              {todo.detail && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-gray-600 break-all whitespace-pre-wrap overflow-hidden">
                    {todo.detail}
                  </p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </Fragment>
  )
}
