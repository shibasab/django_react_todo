import { CREATE_MESSAGE } from '../actions/types'

const initialState = {}

export default function (state = initialState, action: { type: string; payload: Record<string, unknown> }) {
  switch (action.type) {
    case CREATE_MESSAGE:
      return (state = action.payload)
    default:
      return state
  }
}
