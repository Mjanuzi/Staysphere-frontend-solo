/**
 * Authentication Reducer
 *
 * This file contains reducer functions that handle all state transitions
 * for authentication-related actions. It defines how the application state
 * should change in response to each action type.
 */

import { AUTH_ACTIONS } from "./authTypes";

/**
 * Initial state for the authentication reducer
 */
export const initialState = {
  currentUser: null,
  userId: null,
  loading: true,
  error: null,
};

/**
 * Extract user ID from various possible response formats
 * @param {Object} payload - The authentication response payload
 * @returns {string|null} The extracted user ID or null if not found
 */
const extractUserId = (payload) => {
  if (!payload) return null;

  // Try various common ID field names
  return (
    payload.userId ||
    payload.id ||
    payload._id ||
    (payload.user &&
      (payload.user.id || payload.user._id || payload.user.userId)) ||
    null
  );
};

/**
 * Authentication reducer function
 *
 * @param {Object} state - Current state
 * @param {Object} action - Dispatched action with type and payload
 * @returns {Object} New state
 */
export const authReducer = (state, action) => {
  switch (action.type) {
    // Initial state while checking authentication
    case AUTH_ACTIONS.AUTH_INIT:
      return {
        ...state,
        loading: false,
      };

    // Loading state (during login, register, etc)
    case AUTH_ACTIONS.AUTH_LOADING:
      return {
        ...state,
        loading: true,
        error: null,
      };

    // Authentication successful
    case AUTH_ACTIONS.AUTH_SUCCESS:
      // Extract user ID with a more robust approach
      const userId = extractUserId(action.payload);

      if (!userId) {
        console.warn(
          "Auth reducer: No user ID found in payload",
          action.payload
        );
      } else {
        console.log("Auth reducer: Using user ID:", userId);
      }

      return {
        ...state,
        currentUser: action.payload,
        userId: userId,
        loading: false,
        error: null,
      };

    // Authentication failed
    case AUTH_ACTIONS.AUTH_FAILURE:
      return {
        ...state,
        currentUser: null,
        userId: null,
        loading: false,
        error: action.payload,
      };

    // User logged out
    case AUTH_ACTIONS.AUTH_LOGOUT:
      return {
        ...state,
        currentUser: null,
        userId: null,
        loading: false,
        error: null,
      };

    // Clear error
    case AUTH_ACTIONS.AUTH_CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    // Default: return current state
    default:
      return state;
  }
};
