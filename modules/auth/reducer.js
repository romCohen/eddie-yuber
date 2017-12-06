import { handleActions } from 'redux-actions'
import { PUSH_TOKEN_REQUEST } from './actions'

const initialState = {
  pushToken: null
}

export default handleActions(
  {}, initialState
);