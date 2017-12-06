import { CALL_API, Schemas } from '../../middleware/api'

export const QUOTE_REQUEST = 'QUOTE_REQUEST'
export const QUOTE_SUCCESS = 'QUOTE_SUCCESS'
export const QUOTE_FAILURE = 'QUOTE_FAILURE'


export const QUOTE_SELECT_REQUEST = 'QUOTE_SELECT_REQUEST'
export const QUOTE_SELECT_SUCCESS = 'QUOTE_SELECT_SUCCESS'
export const QUOTE_SELECT_FAILURE = 'QUOTE_SELECT_FAILURE'

export const QUOTE_SET_PICKUP_LOCATION = 'QUOTE_SET_PICKUP_LOCATION'
export const QUOTE_SET_DROPOFF_LOCATION = 'QUOTE_SET_DROPOFF_LOCATION'

// fetches a ride quote
const fetchQuote = ({ pickupLocation, dropoffLocation, pickupDatetime, riderId }) => ({
  [CALL_API]: {
    types: [QUOTE_REQUEST, QUOTE_SUCCESS, QUOTE_FAILURE],
    endpoint: `/quote`,
    schema: Schemas.QUOTE,
    options : {
      method: 'post',
      body : {
        pickupLocation,
        dropoffLocation,
        pickupDatetime,
        riderId
      }
    }
  }
})

export const requestQuote = () => (dispatch, getState) => {
  const quote = getState().quote
  const riderId = 'it-doesnt-matter-as-long-as-its-a-string'
  return dispatch(fetchQuote({ 
    pickupLocation : quote.pickupLocation,
    dropoffLocation : quote.dropoffLocation, 
    pickupDatetime : Date.now(),
    riderId: riderId
  }))
}

const selectQuoteRequest = ({ quoteId, vehicleType }) => ({
  [CALL_API]: {
    types: [QUOTE_SELECT_REQUEST, QUOTE_SELECT_SUCCESS, QUOTE_SELECT_FAILURE],
    endpoint: `/trip`,
    schema: Schemas.CURRENT_TRIP,
    options : {
      method: 'post',
      body : {
        quoteId,
        vehicleType
      }
    }
  }
})

export const selectQuote = ({quoteId, vehicleType}) => (dispatch, getState) => {
  return dispatch(selectQuoteRequest({ 
    quoteId, vehicleType
  }))
}

export const setPickupLocation = ({ coordinate }) => (dispatch, getState) => {
  return dispatch({
    type: QUOTE_SET_PICKUP_LOCATION,
    payload: { coordinate }
  })
}

export const setDropoffLocation = ({ coordinate }) => (dispatch, getState) => {
  return dispatch({
    type: QUOTE_SET_DROPOFF_LOCATION,
    payload: { coordinate }
  })
}