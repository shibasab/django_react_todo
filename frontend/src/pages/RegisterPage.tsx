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
    <div className="max-w-md mx-auto mt-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-center mb-6">Register</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              id="username"
              name="username"
              onChange={handleChange}
              value={formState.username}
            />
          </div>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              id="email"
              name="email"
              onChange={handleChange}
              value={formState.email}
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              id="password"
              name="password"
              onChange={handleChange}
              value={formState.password}
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password2" className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              id="password2"
              name="password2"
              onChange={handleChange}
              value={formState.password2}
            />
          </div>
          <div className="mb-4">
            <button
              type="submit"
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Register
            </button>
          </div>
          <p className="text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-700">
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
