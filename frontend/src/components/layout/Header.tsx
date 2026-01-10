import { Link } from 'react-router'

import { useAuth } from '../../hooks/useAuth'

export const Header = () => {
  const { isAuthenticated, user, logout } = useAuth()

  const authLinks = (
    <ul className="navbar-nav mr-auto mt-2 mt-lg-0">
      <span className="navbar-text mr-3">
        <strong>{user ? `Welcome ${user.username}` : ''}</strong>
      </span>
      <li className="nav-item">
        <button onClick={logout} className="nav-link btn btn-info btn-sm text-light">
          Logout
        </button>
      </li>
    </ul>
  )

  const guestLinks = (
    <ul className="navbar-nav mr-auto mt-2 mt-lg-0">
      <li className="nav-item">
        <Link to="/register" className="nav-link">
          Register
        </Link>
      </li>
      <li className="nav-item">
        <Link to="/login" className="nav-link">
          Login
        </Link>
      </li>
    </ul>
  )

  return (
    <nav className="navbar navbar-expand-sm navbar-dark" style={{ background: '#1A535C' }}>
      <div className="container">
        <button
          className="navbar-toggler"
          type="button"
          data-toggle="collapse"
          data-target="#navbarTogglerDemo01"
          aria-controls="navbarTogglerDemo01"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>
        <div className="collapse navbar-collapse" id="navbarTogglerDemo01">
          <a className="navbar-brand" href="#">
            Todo App
          </a>
        </div>
        {isAuthenticated ? authLinks : guestLinks}
      </div>
    </nav>
  )
}
