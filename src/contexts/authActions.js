import axios from "../../api/axios";

/**
 * Login user
 *
 * Logs in a user with the provided credentials
 */
export const login = async (username, password, dispatch) => {
  try {
    dispatch({ type: "AUTH_LOADING" });

    const response = await axios.post("/api/auth/login", {
      username,
      password,
    });

    const { token, user } = response.data;

    // Store token in local storage
    localStorage.setItem("token", token);

    // Set default Authorization header for future requests
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    dispatch({
      type: "AUTH_SUCCESS",
      payload: {
        user,
        userId: user.id,
      },
    });

    dispatch({ type: "AUTH_LOADED" });

    return { success: true };
  } catch (error) {
    console.error("Login failed:", error);

    dispatch({
      type: "AUTH_ERROR",
      payload: error.response?.data?.message || "Login failed",
    });

    dispatch({ type: "AUTH_LOADED" });

    return {
      success: false,
      message: error.response?.data?.message || "Login failed",
    };
  }
};

/**
 * Logout user
 *
 * Logs out the current user and clears authentication data
 */
export const logout = (dispatch) => {
  // Remove token from local storage
  localStorage.removeItem("token");

  // Remove Authorization header
  delete axios.defaults.headers.common["Authorization"];

  // Reset authentication state
  dispatch({ type: "AUTH_RESET" });
};