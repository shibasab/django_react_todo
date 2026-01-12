import { useState, type FormEvent, type ChangeEvent } from 'react'
import { Link } from 'react-router'

import { useAuth } from '../hooks/useAuth'

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
            <label htmlFor="username">Username</label>
            <input
              type="text"
              className="form-control"
              id="username"
              name="username"
              onChange={handleChange}
              value={formState.username}
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              className="form-control"
              id="email"
              name="email"
              onChange={handleChange}
              value={formState.email}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              className="form-control"
              id="password"
              name="password"
              onChange={handleChange}
              value={formState.password}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password2">Confirm Password</label>
            <input
              type="password"
              className="form-control"
              id="password2"
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
