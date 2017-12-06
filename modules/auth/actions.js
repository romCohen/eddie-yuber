import { CALL_API, Schemas } from '../../middleware/api'

export const PUSH_TOKEN_REQUEST = 'PUSH_TOKEN_REQUEST'
export const PUSH_TOKEN_SUCCESS = 'PUSH_TOKEN_SUCCESS'
export const PUSH_TOKEN_FAILURE = 'PUSH_TOKEN_FAILURE'

const fetchPushToken = () => ({
  [CALL_API]: {
    types: [PUSH_TOKEN_REQUEST, PUSH_TOKEN_SUCCESS, PUSH_TOKEN_FAILURE],
    endpoint: `/push-token`,
    schema: Schemas.AUTH
  }
})

export const requestPushToken = () => (dispatch, getState) => {
  return dispatch(fetchPushToken())
}