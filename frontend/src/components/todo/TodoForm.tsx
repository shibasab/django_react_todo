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
    <div className="card card-body mt-4 mb-4">
      <h2>Add Todo</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Task</label>
          <input className="form-control" type="text" name="name" onChange={handleChange} value={formState.name} />
        </div>
        <div className="form-group">
          <label>Detail</label>
          <input className="form-control" type="text" name="detail" onChange={handleChange} value={formState.detail} />
        </div>

        <div className="form-group">
          <button type="submit" className="btn btn-primary">
            Submit
          </button>
        </div>
      </form>
    </div>
  )
}
