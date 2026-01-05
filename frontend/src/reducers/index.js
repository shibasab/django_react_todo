import { combineReducers } from 'redux';
import todo from './todo';
import errors from './errors';
import messages from './messages';
import auth from './auth';

export default combineReducers({
  todo,
  errors,
  messages,
  auth
});
