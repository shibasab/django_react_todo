import { GET_TODOS, DELETE_TODO, ADD_TODO } from '../actions/types.js';

const initialState = {
  todo: []
};

export default function(state = initialState, action) {
  switch (action.type) {
    case GET_TODOS:
      return {
        ...state,
        todo: action.payload
      };
    case DELETE_TODO:
      return {
        ...state,
        todo: state.todo.filter(todo => todo.id !== action.payload)
      };
    case ADD_TODO:
      return {
        ...state,
        todo: [...state.todo, action.payload]
      };
    default:
      return state;
  }
}
