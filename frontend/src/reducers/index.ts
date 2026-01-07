import { combineReducers } from 'redux'

import auth from './auth'
import errors from './errors'
import messages from './messages'
import todo from './todo'

export default combineReducers({
  todo,
  errors,
  messages,
  auth,
})
