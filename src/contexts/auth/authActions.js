/**
 * Authentication Actions
 *
 * This file contains all authentication-related API calls and corresponding
 * responses. It handles communication with the backend
 * and updates the auth state accordingly.
 */

import api from "../../api/axios";
import { AUTH_ACTIONS } from "./authTypes";

/**
 * Check the current authentication status with the backend
 *
 * @param {Function} dispatch - The dispatch function from useReducer
 * @returns {Object|null} User data if authenticated, null otherwise
 */
export const checkAuthStatus = async (dispatch) => {
  try {
    console.log("Checking authentication status...");
    const response = await api.get("/auth/check");
    console.log("Auth check successful:", response.data);

    // Ensure we have a user ID from the response
    const userId =
      response.data.id || response.data.userId || response.data._id;
    console.log("User ID from auth check:", userId);

    if (!userId) {
      console.warn("No user ID found in auth response:", response.data);
      throw new Error("No user ID found in authentication response");
    }

    // Authentication successful - update state with user data
    dispatch({
      type: AUTH_ACTIONS.AUTH_SUCCESS,
      payload: {
        ...response.data,
        userId: userId,
      },
    });

    return response.data;
  } catch (error) {
    console.log("Auth check failed:", error.message);

    // Authentication failed - update state to indicate the user is not authenticated
    dispatch({ type: AUTH_ACTIONS.AUTH_INIT });
    return null;
  }
};

/**
 * Login a user with username and password
 *
 * @param {Function} dispatch - The dispatch function from useReducer
 * @param {string} username - The username to login with
 * @param {string} password - The password to login with
 * @returns {Object} User data if login successful
 * @throws {Error} If login fails
 */
export const login = async (dispatch, username, password) => {
  dispatch({ type: AUTH_ACTIONS.AUTH_LOADING });

  try {
    console.log("Logging in user:", username);
    const response = await api.post("/auth/login", { username, password });
    console.log("Login successful:", response.data);

    // Ensure we have a user ID from the response
    const userId =
      response.data.id || response.data.userId || response.data._id;
    console.log("User ID from login:", userId);

    if (!userId) {
      console.warn("No user ID found in login response:", response.data);
      throw new Error("No user ID found in login response");
    }

    // Login successful - update state with user data including ID
    dispatch({
      type: AUTH_ACTIONS.AUTH_SUCCESS,
      payload: {
        ...response.data,
        userId: userId,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Login failed:", error.message);
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data ||
      "Login failed. Please check your credentials.";

    // Login failed - update state with error
    dispatch({
      type: AUTH_ACTIONS.AUTH_FAILURE,
      payload: errorMessage,
    });

    throw error;
  }
};

/**
 * Register a new user
 *
 * @param {Function} dispatch - The dispatch function from useReducer
 * @param {Object} userData - User data for registration
 * @returns {Object} Registration response
 * @throws {Error} If registration fails
 */
export const register = async (dispatch, userData) => {
  dispatch({ type: AUTH_ACTIONS.AUTH_LOADING });

  try {
    console.log("Registering new user:", userData.username);
    const response = await api.post("/auth/register", userData);
    console.log("Registration successful:", response.data);

    // We don't log in the user automatically after registration
    dispatch({ type: AUTH_ACTIONS.AUTH_INIT });

    return response.data;
  } catch (error) {
    console.error("Registration failed:", error.message);
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data ||
      "Registration failed. Please try again.";

    // Registration failed - update state with error
    dispatch({
      type: AUTH_ACTIONS.AUTH_FAILURE,
      payload: errorMessage,
    });

    throw error;
  }
};

/**
 * Logout the current user
 *
 * @param {Function} dispatch - The dispatch function from useReducer
 */
export const logout = async (dispatch) => {
  dispatch({ type: AUTH_ACTIONS.AUTH_LOADING });

  try {
    console.log("Logging out user");
    await api.post("/auth/logout");
    console.log("Logout successful");

    // Logout successful - clear user data from state
    dispatch({ type: AUTH_ACTIONS.AUTH_LOGOUT });
  } catch (error) {
    console.error("Logout failed:", error.message);

    // Logout failed, but we'll still clear the user from state
    // to ensure the user is logged out on the frontend even if the backend call fails
    dispatch({ type: AUTH_ACTIONS.AUTH_LOGOUT });
  }
};
