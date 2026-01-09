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
      <h4>Todo List</h4>
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Task</th>
            <th>Detail</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {todos.map((todo) => (
            <tr key={todo.id}>
              <td>{todo.name}</td>
              <td>{todo.detail}</td>
              <td>
                <button onClick={() => onDelete(todo.id)} className="btn btn-danger btn-sm">
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Fragment>
  )
}
