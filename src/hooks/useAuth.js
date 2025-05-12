import { useContext } from "react";
import { AuthContext } from "../contexts/auth/AuthContext";

/**
 * Custom hook for accessing the authentication context
 *
 * This hook provides a simple way to access the authentication context
 * from any component without having to use the context consumer directly.
 *
 * @returns {Object} The authentication context value containing:
 *  - currentUser: The current authenticated user object or null if not authenticated
 *  - userId: The ID of the currently authenticated user
 *  - loading: Whether authentication is in progress
 *  - error: Any authentication error that has occurred
 *  - login: Function to authenticate a user with username and password
 *  - logout: Function to end the current user session
 *  - register: Function to create a new user account
 *  - checkAuthStatus: Function to verify the current authentication status
 *  - clearError: Function to clear any authentication errors
 */
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};

export default useAuth;