import axios from "./axios";


const reviewService = {

  addReview: async (listingId, reviewData) => {
    try {
      const response = await axios.post(
        `/api/listings/${listingId}/reviews`,
        reviewData
      );
      return response.data;
    } catch (error) {
      console.error(`Error adding review for listing ${listingId}:`, error);
      throw error;
    }
  },

  getListingReviews: async (listingId) => {
    try {
      const response = await axios.get(`/api/listings/${listingId}/reviews`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching reviews for listing ${listingId}:`, error);
      throw error;
    }
  },

  updateReview: async (reviewId, reviewData) => {
    try {
      const response = await axios.put(`/api/reviews/${reviewId}`, reviewData);
      return response.data;
    } catch (error) {
      console.error(`Error updating review ${reviewId}:`, error);
      throw error;
    }
  },

  deleteReview: async (reviewId) => {
    try {
      const response = await axios.delete(`/api/reviews/${reviewId}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting review ${reviewId}:`, error);
      throw error;
    }
  },
};

export default reviewService;