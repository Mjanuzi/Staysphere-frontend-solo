const authReducer = (state, action) => {
    switch (action.type) {
      case "AUTH_LOADING":
        return {
          ...state,
          loading: true,
          error: null,
        };
  
      case "AUTH_SUCCESS":
        return {
          ...state,
          currentUser: action.payload.user,
          userId: action.payload.userId,
          error: null,
        };
  
      case "AUTH_ERROR":
        return {
          ...state,
          error: action.payload,
        };
  
      case "AUTH_LOADED":
        return {
          ...state,
          loading: false,
        };
  
      case "AUTH_RESET":
        return {
          ...state,
          currentUser: null,
          userId: null,
          error: null,
        };
  
      case "CLEAR_ERROR":
        return {
          ...state,
          error: null,
        };
  
      default:
        return state;
    }
  };
  
  export default authReducer;