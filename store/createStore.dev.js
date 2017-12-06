import { createStore, applyMiddleware } from 'redux';
import { createLogger } from 'redux-logger'
import thunk from 'redux-thunk'
import api from '../middleware/api'
import rootReducer from '../reducer'

const middleware = applyMiddleware(thunk, api, createLogger())

const createCustomStore = (data = {}) => {
  if (module.hot) {
    // Enable Webpack hot module replacement for reducers
    module.hot.accept('../reducer', () => {
      store.replaceReducer(rootReducer)
    })
  }

  return createStore(rootReducer, data, middleware)
};

export default createCustomStore;
