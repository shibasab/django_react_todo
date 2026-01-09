import { Fragment, useEffect } from 'react'

import { useTodo } from '../hooks/useTodo'

// TODO: Phase 4でlayouts/PrivateLayout.tsxにLoading表示と認証チェックを移動する

export const DashboardPage = () => {
  const { todos, isLoading, fetchTodos, addTodo, removeTodo } = useTodo()

  useEffect(() => {
    fetchTodos()
  }, [])

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <Fragment>
      {/* TODO: Phase 3でTodoListとTodoFormコンポーネントを作成して置き換え */}
      <div>
        <h2>TODO Dashboard</h2>
        <p>Todos count: {todos.length}</p>
        {/* 仮実装: 後でTodoListコンポーネントに置き換え */}
        <ul>
          {todos.map((todo) => (
            <li key={todo.id}>
              {todo.name} - {todo.detail}
              <button onClick={() => removeTodo(todo.id)}>Delete</button>
            </li>
          ))}
        </ul>
        {/* 仮実装: 後でTodoFormコンポーネントに置き換え */}
        <div>
          <h3>Add Todo</h3>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              const name = formData.get('name') as string
              const detail = formData.get('detail') as string
              addTodo(name, detail)
              e.currentTarget.reset()
            }}
          >
            <input name="name" placeholder="Name" required />
            <input name="detail" placeholder="Detail" required />
            <button type="submit">Add</button>
          </form>
        </div>
      </div>
    </Fragment>
  )
}
