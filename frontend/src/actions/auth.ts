import axios from 'axios'

import { AppDispatch } from '../store'
import { returnErrors } from './messages'
import {
  USER_LOADED,
  USER_LOADING,
  AUTH_ERROR,
  LOGIN_SUCCESS,
  LOGIN_FAIL,
  LOGOUT_SUCCESS,
  REGISTER_SUCCESS,
  REGISTER_FAIL,
} from './types'

// CHECK TOKEN & LOAD USER
export const loadUser = () => (dispatch: AppDispatch, getState: () => { auth: { token: string } }) => {
  // User Loading
  dispatch({ type: USER_LOADING })

  axios
    .get('/api/auth/user', tokenConfig(getState))
    .then((res) => {
      dispatch({
        type: USER_LOADED,
        payload: res.data,
      })
    })
    .catch((err) => {
      dispatch(returnErrors(err.response.data, err.response.status))
      dispatch({
        type: AUTH_ERROR,
      })
    })
}

// LOGIN USER
export const login =
  (username: string, password: string) =>
  (dispatch: (arg: { type: string; payload?: Record<string, unknown> }) => void) => {
    // Headers
    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
    }

    // Request Body
    const body = JSON.stringify({ username, password })

    axios
      .post('/api/auth/login', body, config)
      .then((res) => {
        dispatch({
          type: LOGIN_SUCCESS,
          payload: res.data,
        })
      })
      .catch((err) => {
        dispatch(returnErrors(err.response.data, err.response.status))
        dispatch({
          type: LOGIN_FAIL,
        })
      })
  }

// REGISTER USER
export const register =
  ({ username, password, email }: { username: string; password: string; email: string }) =>
  (dispatch: (arg: { type: string; payload?: Record<string, unknown> }) => void) => {
    // Headers
    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
    }

    // Request Body
    const body = JSON.stringify({ username, email, password })

    axios
      .post('/api/auth/register', body, config)
      .then((res) => {
        dispatch({
          type: REGISTER_SUCCESS,
          payload: res.data,
        })
      })
      .catch((err) => {
        dispatch(returnErrors(err.response.data, err.response.status))
        dispatch({
          type: REGISTER_FAIL,
        })
      })
  }

// LOGOUT USER
export const logout =
  () =>
  (
    dispatch: (arg: { type: string; payload?: Record<string, unknown> }) => void,
    getState: () => { auth: { token: string } },
  ) => {
    axios
      .post('/api/auth/logout', null, tokenConfig(getState))
      .then((res) => {
        dispatch({
          type: LOGOUT_SUCCESS,
          payload: res.data,
        })
      })
      .catch((err) => {
        dispatch(returnErrors(err.response.data, err.response.status))
      })
  }

// Setup config with token -helper function
export const tokenConfig = (getState: () => { auth: { token: string } }) => {
  // Get token from state
  const token = getState().auth.token

  // Headers
  const config: { headers: { 'Content-Type': string; Authorization?: string } } = {
    headers: {
      'Content-Type': 'application/json',
    },
  }

  // If token, add to headers config
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`
  }

  return config
}
