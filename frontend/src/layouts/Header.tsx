import { Link } from 'react-router'

import { useAuth } from '../hooks/useAuth'

export const Header = () => {
  const { isAuthenticated, user, logout } = useAuth()

  const authLinks = (
    <div className="flex items-center space-x-4">
      <span className="text-white font-semibold">
        {user ? `Welcome ${user.username}` : ''}
      </span>
      <button
        onClick={logout}
        className="px-3 py-1 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 transition-colors text-sm"
      >
        Logout
      </button>
    </div>
  )

  const guestLinks = (
    <div className="flex items-center space-x-4">
      <Link to="/register" className="text-white hover:text-gray-200 transition-colors">
        Register
      </Link>
      <Link to="/login" className="text-white hover:text-gray-200 transition-colors">
        Login
      </Link>
    </div>
  )

  return (
    <nav className="bg-[#1A535C] text-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <a href="#" className="text-xl font-bold text-white hover:text-gray-200">
            Todo App
          </a>
          {isAuthenticated ? authLinks : guestLinks}
        </div>
      </div>
    </nav>
  )
}
