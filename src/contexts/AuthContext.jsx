import { createContext, useReducer, useEffect } from "react";
import authReducer from "./authReducer";
import * as actions from "./authActions";
import axios from "../../api/axios";

/**
 * Den här modulen tillhandahåller hantering av auth state för hela applikationen.
 * Den hanterar användarinloggning, registrering, utloggning och session persistence
 * genom JWT cookies som hanteras av backend.
 *
 * Kontexten innehåller det aktuella användarobjektet och autentiseringsmetoderna
 * som kan konsumeras av vilken komponent som helst i applikationen.
 */

const initialState = {
  currentUser: null,
  userId: null,
  loading: true,
  error: null,
};

export const AuthContext = createContext(initialState);


/**
 * AuthProvider Component
 *
 * En "wrapper" för att tillhandahålla auth state och metoder
 * till alla underordnade komponenter.
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components that will have access to auth context
 */
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check if the user is already authenticated on component mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem("token");

        if (token) {
          // Set token in axios headers
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

          // Fetch current user details
          const response = await axios.get("/api/users/me");

          dispatch({
            type: "AUTH_SUCCESS",
            payload: {
              user: response.data,
              userId: response.data.id,
            },
          });
        } else {
          dispatch({ type: "AUTH_RESET" });
        }
      } catch (error) {
        console.error("Authentication check failed:", error);
        localStorage.removeItem("token");
        dispatch({ type: "AUTH_ERROR", payload: "Session expired" });
      } finally {
        dispatch({ type: "AUTH_LOADED" });
      }
    };

    checkAuthStatus();
  }, []);

  // Method to login a user
  const login = async (username, password) => {
    return actions.login(username, password, dispatch);
  };

  // Method to register a new user
  const register = async (userData) => {
    return actions.register(userData, dispatch);
  };

  // Method to logout the user
  const logout = () => {
    actions.logout(dispatch);
  };

  // Method to check auth status
  const checkAuthStatus = async () => {
    try {
      dispatch({ type: "AUTH_LOADING" });
      const token = localStorage.getItem("token");

      if (token) {
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        const response = await axios.get("/api/users/me");

        dispatch({
          type: "AUTH_SUCCESS",
          payload: {
            user: response.data,
            userId: response.data.id,
          },
        });
      } else {
        dispatch({ type: "AUTH_RESET" });
      }

      dispatch({ type: "AUTH_LOADED" });
    } catch (error) {
      console.error("Authentication check failed:", error);
      localStorage.removeItem("token");
      dispatch({ type: "AUTH_ERROR", payload: "Session expired" });
      dispatch({ type: "AUTH_LOADED" });
    }
  };

  // Method to clear any auth errors
  const clearError = () => {
    dispatch({ type: "CLEAR_ERROR" });
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser: state.currentUser,
        userId: state.userId,
        loading: state.loading,
        error: state.error,
        login,
        register,
        logout,
        checkAuthStatus,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};