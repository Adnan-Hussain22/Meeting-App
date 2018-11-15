const reducer = (state = {}, action) => {
    switch (action.type) {
      case "UPDATE_MEETINGLIST": {
        return { ...state, list: action.data };
      }
  
      default: {
        return state;
      }
    }
  };
  
  export default reducer;
  