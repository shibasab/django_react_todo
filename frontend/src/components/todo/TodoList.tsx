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
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">Task</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">Detail</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b" />
            </tr>
          </thead>
          <tbody>
            {todos.map((todo, index) => (
              <tr key={todo.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-4 py-3 border-b">{todo.name}</td>
                <td className="px-4 py-3 border-b">{todo.detail}</td>
                <td className="px-4 py-3 border-b">
                  <button
                    onClick={() => onDelete(todo.id)}
                    className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Fragment>
  )
}
