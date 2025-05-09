/**
 * Authentication Action Types
 *
 * This file contains constants for all actions used in the authentication flow.
 * Using constants instead of strings helps prevent typos and makes refactoring easier.
 */

export const AUTH_ACTIONS = {
  // Initial loading state when checking authentication status
  AUTH_INIT: "AUTH_INIT",

  // Authentication is in progress
  AUTH_LOADING: "AUTH_LOADING",

  // Authentication completed successfully
  AUTH_SUCCESS: "AUTH_SUCCESS",

  // Authentication failed with an error
  AUTH_FAILURE: "AUTH_FAILURE",

  // User logged out
  AUTH_LOGOUT: "AUTH_LOGOUT",

  // Clear authentication errors
  AUTH_CLEAR_ERROR: "AUTH_CLEAR_ERROR",
};
