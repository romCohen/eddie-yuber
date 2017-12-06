import { handleActions } from 'redux-actions'
import * as actions from './actions';

const initialState = {
  defaultLocation : {
    latitude: 40.755410,
    longitude: -73.954947,
  },
  pickupLocation: null,
  dropoffLocation: null
}

export default handleActions(
  {
    [actions.QUOTE_SET_PICKUP_LOCATION] : (state, action) => (
      Object.assign({}, { ...state }, {
        pickupLocation : action.payload.coordinate
      })
    ),
    [actions.QUOTE_SET_DROPOFF_LOCATION] : (state, action) => (
      Object.assign({}, { ...state }, {
        dropoffLocation : action.payload.coordinate
      })
    )
  }, initialState
);