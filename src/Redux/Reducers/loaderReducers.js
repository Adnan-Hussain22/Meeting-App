const reducer = (state = {}, action) => {
    switch (action.type) {
      case "UPDATE_LOADER": {
        return { ...state, loader: action.data };
      }
  
      default: {
        return state;
      }
    }
  };
  
  export default reducer;
  