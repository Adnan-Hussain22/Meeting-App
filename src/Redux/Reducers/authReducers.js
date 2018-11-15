const reducer = (state = {}, action) => {
  switch (action.type) {
    case "UPDATE_USER": {
      return { ...state, user: action.data };
    }

    case "REMOVE_USER": {
      return { ...state, user: null };
    }

    default: {
      return state;
    }
  }
};

export default reducer;
