import api from "./axios";

/**
 * Creates a new booking
 * @param {Object} bookingData - Booking data to be created
 * @returns {Promise<Object>} - The created booking
 */
export const createBooking = async (bookingData) => {
  try {
    console.log("Creating new booking:", bookingData);
    // Set both pending and isPending for new bookings
    // This ensures the backend model gets the correct value
    const bookingWithStatus = {
      ...bookingData,
      status: bookingData.status !== undefined ? bookingData.status : false,
      pending: bookingData.pending !== undefined ? bookingData.pending : true,
      isPending:
        bookingData.isPending !== undefined ? bookingData.isPending : true,
    };

    const response = await api.post("/api/bookings", bookingWithStatus);
    return response.data;
  } catch (error) {
    console.error(
      "Error creating booking:",
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * Gets all bookings (admin only)
 * @returns {Promise<Array>} - All bookings in the system
 */
export const getAllBookings = async () => {
  try {
    console.log("Fetching all bookings (admin)");
    const response = await api.get("/api/bookings/all");
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching all bookings:",
      error.response?.data || error.message
    );
    // For 403/404 errors, return empty array instead of throwing
    if (
      error.response &&
      (error.response.status === 403 || error.response.status === 404)
    ) {
      return [];
    }
    throw error;
  }
};

/**
 * Gets bookings for a specific user
 * @param {string} userId - User ID to get bookings for
 * @returns {Promise<Array>} - User's bookings
 */
export const getUserBookings = async (userId) => {
  try {
    console.log(`Fetching bookings for user: ${userId}`);
    const response = await api.get(`/api/bookings/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error(
      `Error fetching user bookings for ${userId}:`,
      error.response?.data || error.message
    );
    // For 403/404 errors, return empty array instead of throwing
    if (
      error.response &&
      (error.response.status === 403 || error.response.status === 404)
    ) {
      return [];
    }
    throw error;
  }
};

/**
 * Gets bookings for a specific host
 * @param {string} hostId - Host ID to get bookings for
 * @returns {Promise<Array>} - Host's bookings
 */
export const getHostBookings = async (hostId) => {
  try {
    console.log(`Fetching bookings for host: ${hostId}`);
    const response = await api.get(`/api/bookings/host/${hostId}`);
    return response.data;
  } catch (error) {
    console.error(
      `Error fetching host bookings for ${hostId}:`,
      error.response?.data || error.message
    );
    // For 403/404 errors, return empty array instead of throwing
    if (
      error.response &&
      (error.response.status === 403 || error.response.status === 404)
    ) {
      return [];
    }
    throw error;
  }
};

/**
 * Gets a specific booking by ID
 * @param {string} bookingId - Booking ID to get
 * @returns {Promise<Object>} - The booking
 */
export const getBookingById = async (bookingId) => {
  try {
    console.log(`Fetching booking by ID: ${bookingId}`);
    const response = await api.get(`/api/bookings/${bookingId}`);
    return response.data;
  } catch (error) {
    console.error(
      `Error fetching booking ${bookingId}:`,
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * Gets bookings for a specific listing
 * @param {string} listingId - Listing ID to get bookings for
 * @returns {Promise<Array>} - Listing's bookings
 */
export const getListingBookings = async (listingId) => {
  try {
    console.log(`Fetching bookings for listing: ${listingId}`);
    const response = await api.get(
      `/api/bookings/listings/${listingId}/bookings`
    );
    return response.data;
  } catch (error) {
    console.error(
      `Error fetching listing bookings for ${listingId}:`,
      error.response?.data || error.message
    );
    // For 403/404 errors, return empty array instead of throwing
    if (
      error.response &&
      (error.response.status === 403 || error.response.status === 404)
    ) {
      return [];
    }
    throw error;
  }
};

/**
 * Updates a booking's status
 * @param {string} bookingId - Booking ID to update
 * @param {Object} statusData - Status data to update
 * @returns {Promise<Object>} - The updated booking
 */
export const updateBookingStatus = async (bookingId, statusData) => {
  try {
    console.log(`Updating booking status for: ${bookingId}`, statusData);
    // Make sure both property names are set for consistency
    const completeStatusData = {
      ...statusData,
      isPending:
        statusData.pending !== undefined
          ? statusData.pending
          : statusData.isPending,
      pending:
        statusData.isPending !== undefined
          ? statusData.isPending
          : statusData.pending,
    };

    const response = await api.patch(
      `/api/bookings/${bookingId}`,
      completeStatusData
    );
    return response.data;
  } catch (error) {
    console.error(
      `Error updating booking status for ${bookingId}:`,
      error.response?.data || error.message
    );
    throw error;
  }
};

// Export all service functions as a default object
const bookingService = {
  createBooking,
  getAllBookings,
  getUserBookings,
  getHostBookings,
  getBookingById,
  getListingBookings,
  updateBookingStatus,
};

export default bookingService;
