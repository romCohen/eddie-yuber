import { normalize, schema } from 'normalizr';
import { camelizeKeys, decamelizeKeys } from 'humps';

const API_ROOT = 'http://10.0.1.9:8000'

// Fetches an API response and normalizes the result JSON according to schema.
const callApi = (endpoint, schema, options) => {
  const fullUrl = (endpoint.indexOf(API_ROOT) === -1) ? API_ROOT + endpoint : endpoint
  return (
    options ? 
    fetch(fullUrl, {
      ...options, body : JSON.stringify(decamelizeKeys(options.body))
    }) : 
    fetch(fullUrl)
  )
    .then(response =>
      response.json().then(json => {
        if (!response.ok) {
          return Promise.reject(json)
        }

        return Object.assign({},
          normalize(camelizeKeys(json), schema)
        )
      })
    )
}

const userSchema = new schema.Entity('users', {}, {
  idAttribute: user => user.login.toLowerCase()
})

const quoteSchema = new schema.Entity('quote', {}, {
  idAttribute: quote => quote.id
})

const currentTripSchema = new schema.Entity('currentTrip', {}, {
  idAttribute: tripObject => tripObject.tripId
})

const pushTokenSchema = new schema.Entity('push', {}, {
  idAttribute: token => token
})

const authSchema = new schema.Entity('auth', {
  pushToken: pushTokenSchema
}, {
  idAttribute: 'auth'
})



// Schemas for responses
export const Schemas = {
  USER: userSchema,
  QUOTE: quoteSchema,
  AUTH: authSchema,
  CURRENT_TRIP: currentTripSchema
}

// Action key that carries API call info interpreted by this Redux middleware.
export const CALL_API = 'Call API'

// A Redux middleware that interprets actions with CALL_API info specified.
// Performs the call and promises when such actions are dispatched.
export default store => next => action => {
  const callAPI = action[CALL_API]
  if (typeof callAPI === 'undefined') {
    return next(action)
  }

  let { endpoint } = callAPI
  const { options, schema, types } = callAPI

  if (typeof endpoint === 'function') {
    endpoint = endpoint(store.getState())
  }

  if (typeof endpoint !== 'string') {
    throw new Error('Specify a string endpoint URL.')
  }
  if (!schema) {
    throw new Error('Specify one of the exported Schemas.')
  }
  if (!Array.isArray(types) || types.length !== 3) {
    throw new Error('Expected an array of three action types.')
  }
  if (!types.every(type => typeof type === 'string')) {
    throw new Error('Expected action types to be strings.')
  }

  const actionWith = data => {
    const finalAction = Object.assign({}, action, data)
    delete finalAction[CALL_API]
    return finalAction
  }

  const [requestType, successType, failureType] = types
  next(actionWith({ type: requestType }))

  return callApi(endpoint, schema, options).then(
    response => next(actionWith({
      response,
      type: successType
    })),
    error => {
        return next(actionWith({
        type: failureType,
        error: error.message || 'Something bad happened'
      }))
    }
  )
}