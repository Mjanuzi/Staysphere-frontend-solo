import axios from "./axios";


const listingService = {

  getAllListings: async (params = {}) => {
    try {
      const response = await axios.get("/api/listings", { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching listings:", error);
      throw error;
    }
  },


  getListingById: async (id) => {
    try {
      const response = await axios.get(`/api/listings/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching listing with ID ${id}:`, error);
      throw error;
    }
  },


  createListing: async (listingData) => {
    try {
      const response = await axios.post("/api/listings", listingData);
      return response.data;
    } catch (error) {
      console.error("Error creating listing:", error);
      throw error;
    }
  },


  updateListing: async (id, listingData) => {
    try {
      const response = await axios.put(`/api/listings/${id}`, listingData);
      return response.data;
    } catch (error) {
      console.error(`Error updating listing with ID ${id}:`, error);
      throw error;
    }
  },


  deleteListing: async (id) => {
    try {
      const response = await axios.delete(`/api/listings/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting listing with ID ${id}:`, error);
      throw error;
    }
  },


  getUserListings: async (userId) => {
    try {
      const response = await axios.get(`/api/users/${userId}/listings`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching listings for user ${userId}:`, error);
      throw error;
    }
  },

  addAvailability: async (listingId, availabilityData) => {
    try {
      const response = await axios.post(
        `/api/listings/${listingId}/availability`,
        availabilityData
      );
      return response.data;
    } catch (error) {
      console.error(
        `Error adding availability to listing ${listingId}:`,
        error
      );
      throw error;
    }
  },


  getListingAvailability: async (listingId) => {
    try {
      const response = await axios.get(
        `/api/listings/${listingId}/availability`
      );
      return response.data;
    } catch (error) {
      console.error(
        `Error fetching availability for listing ${listingId}:`,
        error
      );
      throw error;
    }
  },
};

export default listingService;