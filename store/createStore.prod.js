import { createStore, applyMiddleware, combineReducers } from 'redux'
import thunk from 'redux-thunk'
import api from '../middleware/api'
import rootReducer from '../reducer'

const middleware = applyMiddleware(thunk, api)

const createCustomStore = (data = {}) => {
  return createStore(rootReducer, data, middleware)
};

export default createCustomStore;
