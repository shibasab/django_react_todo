import { useState, type FormEvent, type ChangeEvent } from 'react'
import { Link, Redirect } from 'react-router-dom'

import { useAuth } from '../services/auth'

// TODO: Phase 4でlayouts/PublicLayout.tsxに認証チェックを移動し、以下の認証関連処理を削除する

type LoginFormState = Readonly<{
  username: string
  password: string
}>

export const LoginPage = () => {
  const { isAuthenticated, login } = useAuth()
  const [formState, setFormState] = useState<LoginFormState>({
    username: '',
    password: '',
  })

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    await login(formState.username, formState.password)
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormState((prev) => ({ ...prev, [name]: value }))
  }

  if (isAuthenticated) {
    return <Redirect to="/" />
  }

  return (
    <div className="col-md-6 m-auto">
      <div className="card card-body mt-5">
        <h2 className="text-center">Login</h2>
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
            <button type="submit" className="btn btn-primary">
              Login
            </button>
          </div>
          <p>
            Don't have an account? <Link to="/register">Register</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
