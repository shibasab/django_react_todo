import { useState, type FormEvent, type ChangeEvent } from 'react'
import { Link } from 'react-router'

import { useAuth } from '../services/auth'

type RegisterFormState = Readonly<{
  username: string
  email: string
  password: string
  password2: string
}>

export const RegisterPage = () => {
  const { register } = useAuth()
  const [formState, setFormState] = useState<RegisterFormState>({
    username: '',
    email: '',
    password: '',
    password2: '',
  })

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const { username, email, password, password2 } = formState

    if (password !== password2) {
      // TODO: Alerts機能は後で実装
      console.error('Passwords do not match')
      return
    }

    await register(username, email, password)
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormState((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <div className="col-md-6 m-auto">
      <div className="card card-body mt-5">
        <h2 className="text-center">Register</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              className="form-control"
              name="username"
              onChange={handleChange}
              value={formState.username}
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" className="form-control" name="email" onChange={handleChange} value={formState.email} />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              className="form-control"
              name="password"
              onChange={handleChange}
              value={formState.password}
            />
          </div>
          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              className="form-control"
              name="password2"
              onChange={handleChange}
              value={formState.password2}
            />
          </div>
          <div className="form-group">
            <button type="submit" className="btn btn-primary">
              Register
            </button>
          </div>
          <p>
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
