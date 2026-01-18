import { useState, type FormEvent, type ChangeEvent } from 'react'

import type { ValidationError } from '../../models/error'

import { TODO_NAME_MAX_LENGTH, TODO_DETAIL_MAX_LENGTH } from '../../hooks/useTodo'
import { FieldError } from '../FieldError'

type TodoFormProps = Readonly<{
  onSubmit: (name: string, detail: string) => Promise<readonly ValidationError[] | undefined>
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
  const [errors, setErrors] = useState<readonly ValidationError[]>([])

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormState((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const validationErrors = await onSubmit(formState.name, formState.detail)
    if (validationErrors != null && validationErrors.length > 0) {
      setErrors(validationErrors)
      return
    }
    setFormState({ name: '', detail: '' })
    setErrors([])
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
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.some((e) => e.field === 'name') ? 'border-red-500' : 'border-gray-300'
            }`}
            type="text"
            maxLength={TODO_NAME_MAX_LENGTH}
            name="name"
            onChange={handleChange}
            value={formState.name}
          />
          <FieldError errors={errors} fieldName="name" fieldLabel="タスク名" />
        </div>
        <div className="mb-4">
          <label htmlFor="todo-detail" className="block text-sm font-medium text-gray-700 mb-2">
            Detail
          </label>
          <input
            id="todo-detail"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.some((e) => e.field === 'detail') ? 'border-red-500' : 'border-gray-300'
            }`}
            type="text"
            maxLength={TODO_DETAIL_MAX_LENGTH}
            name="detail"
            onChange={handleChange}
            value={formState.detail}
          />
          <FieldError errors={errors} fieldName="detail" fieldLabel="詳細" />
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
