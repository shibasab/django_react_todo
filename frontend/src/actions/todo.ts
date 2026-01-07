import axios from 'axios';

import { tokenConfig } from './auth';
import { createMessage, returnErrors } from './messages';
import { GET_TODOS, DELETE_TODO, ADD_TODO, GET_ERRORS } from './types';

// GET TODOS
export const getTodos =
  () =>
  (
    dispatch: (arg: { type: string; payload?: Record<string, unknown> }) => void,
    getState: () => { auth: { token: string } },
  ) => {
    axios
      .get('/api/todo/', tokenConfig(getState))
      .then((res) => {
        dispatch({
          type: GET_TODOS,
          payload: res.data,
        });
      })
      .catch((err) => dispatch(returnErrors(err.response.data, err.response.status)));
  };

//DELETE TODO
export const deleteTodo = (id: string) => (dispatch: Function, getState: () => { auth: { token: string } }) => {
  axios
    .delete(`/api/todo/${id}/`, tokenConfig(getState))
    .then((res) => {
      dispatch(createMessage({ deleteTodo: 'Todo Deleted' }));
      dispatch({
        type: DELETE_TODO,
        payload: id,
      });
    })
    .catch((err) => console.log(err));
};

//ADD TODO
export const addTodo = (todo: {}) => (dispatch: Function, getState: () => { auth: { token: string } }) => {
  axios
    .post('/api/todo/', todo, tokenConfig(getState))
    .then((res) => {
      dispatch(createMessage({ addTodo: 'Todo Added' }));
      dispatch({
        type: ADD_TODO,
        payload: res.data,
      });
    })
    .catch((err) => dispatch(returnErrors(err.response.data, err.response.status)));
};
