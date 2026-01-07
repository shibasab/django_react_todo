import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Link, Redirect } from 'react-router-dom'

import { login } from '../../actions/auth'

interface LoginState {
  username: string
  password: string
}

interface LoginProps {
  login: (username: string, password: string) => void
  isAuthenticated: boolean
}

export class Login extends Component<LoginProps, LoginState> {
  state: LoginState = {
    username: '',
    password: '',
  }

  onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    this.props.login(this.state.username, this.state.password)
  }

  onChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    this.setState({ [e.target.name]: e.target.value } as Pick<LoginState, keyof LoginState>)

  render() {
    if (this.props.isAuthenticated) {
      return <Redirect to="/" />
    }
    const { username, password } = this.state
    return (
      <div className="col-md-6 m-auto">
        <div className="card card-body mt-5">
          <h2 className="text-center">Login</h2>
          <form onSubmit={this.onSubmit}>
            <div className="form-group">
              <label>Username</label>
              <input type="text" className="form-control" name="username" onChange={this.onChange} value={username} />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                className="form-control"
                name="password"
                onChange={this.onChange}
                value={password}
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
}

const mapStateToProps = (state: { auth: { isAuthenticated: boolean } }) => ({
  isAuthenticated: state.auth.isAuthenticated,
})

export default connect(mapStateToProps, { login })(Login)
