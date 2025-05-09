/**
 * Authentication Module Barrel File
 *
 * This file re-exports all necessary components, hooks, etc.
 * from the auth module. Doing this simplifies imports from other parts
 * of the application and helps keep code easier to manage.
 */

// Export context and provider
export { AuthContext, AuthProvider } from "./AuthContext";

// Export action types
export { AUTH_ACTIONS } from "./authTypes";

// Export reducer and initial state
export { authReducer, initialState } from "./authReducer";

// Export individual action creators for direct access if needed
export { checkAuthStatus, login, register, logout } from "./authActions";
