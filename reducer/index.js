import { quote, auth } from '../modules';
import merge from 'lodash/merge'
import { combineReducers } from 'redux';

const entities = (state = { quote: {}, auth: {} }, action) => {
  if (action.response && action.response.entities) {
    return merge({}, state, action.response.entities)
  }
  return state
}

const rootReducer = combineReducers({
  [quote.MODULE_NAME]: quote.reducer,
  [auth.MODULE_NAME]: auth.reducer,
  entities
})

export default rootReducer