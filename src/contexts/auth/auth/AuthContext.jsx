import {
  createContext,
  useReducer,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { authReducer, initialState } from "./authReducer";
import * as authActions from "./authActions";

/**
 * Authentication Context
 *
 * This context provides authentication state and methods to the entire application.
 * It uses the reducer pattern for more predictable state management.
 */
export const AuthContext = createContext();

/**
 * AuthProvider Component
 *
 * Provides authentication state and methods to all child components.
 * Uses a reducer to manage state transitions and performance optimization hooks.
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 */
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check authentication status when the app initializes
  useEffect(() => {
    const initAuth = async () => {
      await authActions.checkAuthStatus(dispatch);
    };

    initAuth();
  }, []);

  // Memoize authentication methods with useCallback to prevent unnecessary re-renders
  const handleLogin = useCallback(async (username, password) => {
    return await authActions.login(dispatch, username, password);
  }, []);

  const handleRegister = useCallback(async (userData) => {
    return await authActions.register(dispatch, userData);
  }, []);

  const handleLogout = useCallback(async () => {
    return await authActions.logout(dispatch);
  }, []);

  const handleCheckAuthStatus = useCallback(async () => {
    return await authActions.checkAuthStatus(dispatch);
  }, []);

  const handleClearError = useCallback(() => {
    dispatch({ type: "AUTH_CLEAR_ERROR" });
  }, []);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      // Current state
      currentUser: state.currentUser,
      userId: state.userId,
      loading: state.loading,
      error: state.error,

      // Authentication methods
      login: handleLogin,
      register: handleRegister,
      logout: handleLogout,
      checkAuthStatus: handleCheckAuthStatus,
      clearError: handleClearError,
    }),
    [
      state.currentUser,
      state.userId,
      state.loading,
      state.error,
      handleLogin,
      handleRegister,
      handleLogout,
      handleCheckAuthStatus,
      handleClearError,
    ]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {!state.loading && children}
    </AuthContext.Provider>
  );
};