import api from "./axios";

import axios from "./axios";


const bookingService = {

  createBooking: async (bookingData) => {
    try {
      const response = await axios.post("/api/bookings", bookingData);
      return response.data;
    } catch (error) {
      console.error("Error creating booking:", error);
      throw error;
    }
  },


  getUserBookings: async (userId) => {
    try {
      const response = await axios.get(`/api/users/${userId}/bookings`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching bookings for user ${userId}:`, error);
      throw error;
    }
  },

  getListingBookings: async (listingId) => {
    try {
      const response = await axios.get(`/api/listings/${listingId}/bookings`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching bookings for listing ${listingId}:`, error);
      throw error;
    }
  },

  updateBookingStatus: async (bookingId, status) => {
    try {
      const response = await axios.patch(`/api/bookings/${bookingId}/status`, {
        status,
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating status for booking ${bookingId}:`, error);
      throw error;
    }
  },
};

export default bookingService;