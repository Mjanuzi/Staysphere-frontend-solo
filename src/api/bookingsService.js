import api from "./axios";

/**
 * Booking Service
 *
 * Service for handling booking-related API requests.
 * This service interfaces with the backend BookingsController endpoints.
 */

/**
 * Create a new booking
 * Endpoint: POST /api/bookings
 *
 * @param {Object} bookingData - New booking data
 * @returns {Promise<Object>} Created booking
 */
export const createBooking = async (bookingData) => {
  try {
    // Ensure all required fields are present with proper formatting
    const currentDate = new Date();

    // Format bookingDate as ISO string
    const formattedBookingData = {
      ...bookingData,
      // Add bookingDate if not provided (required by backend)
      bookingDate: bookingData.bookingDate || currentDate.toISOString(),
      // Set both pending and isPending flags
      status: bookingData.status !== undefined ? bookingData.status : false,
      pending: bookingData.pending !== undefined ? bookingData.pending : true,
      isPending:
        bookingData.isPending !== undefined ? bookingData.isPending : true,
      // Ensure start and end dates are in ISO format
      startDate:
        bookingData.startDate ||
        (bookingData.checkIn
          ? new Date(bookingData.checkIn).toISOString()
          : null),
      endDate:
        bookingData.endDate ||
        (bookingData.checkOut
          ? new Date(bookingData.checkOut).toISOString()
          : null),
    };

    console.log("Sending formatted booking data:", formattedBookingData);

    // Use the full path with leading slash
    const response = await api.post("/api/bookings", formattedBookingData);
    return response.data;
  } catch (error) {
    console.error(
      "Error in createBooking:",
      error.response?.data || error.message
    );
    throw error;
  }
};

/**
 * Get bookings for a specific user
 * Endpoint: GET /api/bookings/user/{userId}
 *
 * @param {string} userId - User ID
 * @returns {Promise<Array>} User's bookings
 */
export const getUserBookings = async (userId) => {
  try {
    console.log(`Fetching bookings for user with ID: ${userId}`);
    const response = await api.get(`/api/bookings/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching bookings for user ${userId}:`, error);
    throw error;
  }
};

/**
 * Get bookings for a specific host
 * Endpoint: GET /api/bookings/host/{hostId}
 *
 * @param {string} hostId - Host ID
 * @returns {Promise<Array>} Host's bookings
 */
export const getHostBookings = async (hostId) => {
  try {
    console.log(`Fetching bookings for host with ID: ${hostId}`);
    const response = await api.get(`/api/bookings/host/${hostId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching bookings for host ${hostId}:`, error);
    throw error;
  }
};

/**
 * Get bookings for a specific listing
 * Endpoint: GET /api/bookings/listings/{listingId}/bookings
 *
 * @param {string} listingId - Listing ID
 * @returns {Promise<Array>} Bookings for the listing
 */
export const getListingBookings = async (listingId) => {
  try {
    console.log(`Fetching bookings for listing with ID: ${listingId}`);
    const response = await api.get(
      `/api/bookings/listings/${listingId}/bookings`
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching bookings for listing ${listingId}:`, error);
    throw error;
  }
};

/**
 * Update a booking's status
 * Endpoint: PATCH /api/bookings/{bookingId}
 *
 * @param {string} bookingId - Booking ID
 * @param {Object} statusData - Status data to update
 * @returns {Promise<Object>} Updated booking
 */
export const updateBookingStatus = async (bookingId, statusData) => {
  try {
    console.log(`Updating booking status for booking ID: ${bookingId}`);
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
    console.error(`Error updating booking status for ID ${bookingId}:`, error);
    throw error;
  }
};

// Export all service functions as a default object
const bookingService = {
  createBooking,
  getUserBookings,
  getHostBookings,
  getListingBookings,
  updateBookingStatus,
};

export default bookingService;
