import { useState, type FormEvent, type ChangeEvent } from 'react'

type TodoFormProps = Readonly<{
  onSubmit: (name: string, detail: string) => void
}>

type FormState = Readonly<{
  name: string
  detail: string
}>

export const TodoForm = ({ onSubmit }: TodoFormProps) => {
  const [formState, setFormState] = useState<FormState>({
    name: '',
    detail: '',
  })

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormState((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    onSubmit(formState.name, formState.detail)
    setFormState({ name: '', detail: '' })
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 my-6">
      <h2 className="text-xl font-bold mb-4">Add Todo</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="todo-name" className="block text-sm font-medium text-gray-700 mb-2">
            Task
          </label>
          <input
            id="todo-name"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            type="text"
            name="name"
            onChange={handleChange}
            value={formState.name}
          />
        </div>
        <div className="mb-4">
          <label htmlFor="todo-detail" className="block text-sm font-medium text-gray-700 mb-2">
            Detail
          </label>
          <input
            id="todo-detail"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            type="text"
            name="detail"
            onChange={handleChange}
            value={formState.detail}
          />
        </div>

        <div className="mb-4">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  )
}
