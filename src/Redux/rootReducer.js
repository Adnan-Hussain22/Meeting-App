// combine all the reducers here and export it
import {combineReducers} from 'redux'
import authReducers from './Reducers/authReducers';
import miscellaneousReducers from './Reducers/miscellaneousReducers';
import meetingsReducers from './Reducers/meetingReducers';

export default combineReducers({
    authReducers,miscellaneousReducers,meetingsReducers
})