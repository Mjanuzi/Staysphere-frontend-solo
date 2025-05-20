import api from "./axios";

/**
 * Listing Service
 *
 * Service for handling listing-related API requests.
 * This service interfaces with the backend ListingController endpoints.
 */

// Track pending requests
const requestCache = {
  allListings: null,
  timestamp: 0,
  ttl: 60000, // 1 minute cache
};

/**
 * Get all listings
 * Endpoint: GET /api/listing/getall
 *
 * @returns {Promise<Array>} Array of listings
 */
export const getAllListings = async () => {
  try {
    console.log("Fetching all listings");
    const response = await api.get("/api/listing/getall");
    return response.data;
  } catch (error) {
    console.error("Error fetching listings:", error);
    throw error;
  }
};

/**
 * Get paginated listings
 * This is a client-side function that gets all listings and then paginates them
 *
 * @param {number} page - Current page number (0-based)
 * @param {number} pageSize - Number of items per page
 * @returns {Promise<Object>} Response with paginated listings and metadata
 */
const getPaginatedListings = async (page = 0, pageSize = 10) => {
  try {
    console.log(`Fetching paginated listings - page ${page}, size ${pageSize}`);

    // Get all listings
    const response = await getAllListings();
    const allListings = response.data;

    // Calculate total pages
    const totalItems = allListings.length;
    const totalPages = Math.ceil(totalItems / pageSize);

    // Get slice of listings for current page
    const startIndex = page * pageSize;
    const endIndex = Math.min(startIndex + pageSize, totalItems);
    const paginatedListings = allListings.slice(startIndex, endIndex);

    // Return modified response with pagination metadata
    return {
      data: paginatedListings,
      pagination: {
        totalItems,
        totalPages,
        currentPage: page,
        pageSize,
        hasNext: page < totalPages - 1,
        hasPrevious: page > 0,
      },
    };
  } catch (error) {
    console.error("Error fetching paginated listings:", error);
    throw error;
  }
};

/**
 * Get a listing by ID
 * Endpoint: GET /api/listing/getbyid/{listingId}
 *
 * @param {string} id - Listing ID
 * @returns {Promise<Object>} Listing details
 */
export const getListingById = async (id) => {
  try {
    console.log(`Fetching listing with ID: ${id}`);
    const response = await api.get(`/api/listing/getbyid/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching listing with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Get listings for a host
 * Endpoint: GET /api/listing/gethostbyid/{userId}
 *
 * @param {string} hostId - Host user ID
 * @returns {Promise<Array>} Host's listings
 */
export const getListingsByHostId = async (hostId) => {
  try {
    console.log(`Fetching listings for host with ID: ${hostId}`);
    const response = await api.get(`/api/listing/gethostbyid/${hostId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching listings for host with ID ${hostId}:`, error);
    throw error;
  }
};

/**
 * Filter listings by price range
 * Endpoint: GET /api/listing/all/pricebetween
 *
 * @param {number} minPrice - Minimum price
 * @param {number} maxPrice - Maximum price
 * @returns {Promise<Array>} Filtered listings
 */
export const getListingsByPriceRange = async (minPrice, maxPrice) => {
  try {
    console.log(
      `Fetching listings with price between ${minPrice} and ${maxPrice}`
    );
    const response = await api.get(`/api/listing/all/pricebetween`, {
      params: { minPrice, maxPrice },
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching listings by price range:`, error);
    throw error;
  }
};

/**
 * Create a new listing
 * Endpoint: POST /api/listing/create
 *
 * @param {Object} listingData - New listing data
 * @returns {Promise<Object>} Created listing
 */
export const createListing = async (listingData) => {
  try {
    console.log("Creating new listing");
    const response = await api.post(`/api/listing/create`, listingData);
    return response.data;
  } catch (error) {
    console.error("Error creating listing:", error);
    throw error;
  }
};

/**
 * Update a listing
 * Endpoint: PATCH /api/listing/patch/{listingId}
 *
 * @param {string} listingId - Listing ID to update
 * @param {Object} listingData - Updated listing data
 * @returns {Promise<Object>} Updated listing
 */
export const updateListing = async (listingId, listingData) => {
  try {
    console.log(`Updating listing with ID: ${listingId}`);
    const response = await api.patch(
      `/api/listing/patch/${listingId}`,
      listingData
    );
    return response.data;
  } catch (error) {
    console.error(`Error updating listing with ID ${listingId}:`, error);
    throw error;
  }
};

/**
 * Delete a listing
 * Endpoint: DELETE /api/listing/delete/{listingId}
 *
 * @param {string} listingId - Listing ID to delete
 * @returns {Promise<Object>} Response indicating success
 */
export const deleteListing = async (listingId) => {
  try {
    console.log(`Deleting listing with ID: ${listingId}`);
    const response = await api.delete(`/api/listing/delete/${listingId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting listing with ID ${listingId}:`, error);
    throw error;
  }
};

/**
 * Add availability to a listing
 * Endpoint: POST /api/listing/listings/{listingId}/availability
 *
 * @param {string} listingId - Listing ID
 * @param {Object} availabilityData - Availability data
 * @returns {Promise<Object>} Updated listing
 */
export const addAvailability = async (listingId, availabilityData) => {
  try {
    /*console.log(`Adding availability to listing with ID: ${listingId}`, availabilityData);*/
    // Using the exact endpoint structure as defined in the backend controller
    const response = await api.post(
      `/api/listing/listings/${listingId}/availability`,
      availabilityData
    );
    return response.data;
  } catch (error) {
    console.error(
      `Error adding availability to listing with ID ${listingId}:`,
      error.response || error
    );
    throw error;
  }
};

/**
 * Get listings for the current authenticated user
 * Endpoint: GET /api/listing/gethostbyid/{userId}
 *
 * @param {string} userId - The ID of the current user
 * @returns {Promise<Array>} User's listings
 */
export const getMyListings = async (userId) => {
  if (!userId) {
    console.warn("User ID is required for getMyListings");
    return [];
  }

  try {
    console.log(`Fetching listings for current user with ID: ${userId}`);
    const response = await api.get(`/api/listing/gethostbyid/${userId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching listings for current user:`, error);
    return [];
  }
};

// Export all service functions
const listingService = {
  getAllListings,
  getPaginatedListings,
  getListingById,
  getListingsByHostId,
  getListingsByPriceRange,
  createListing,
  updateListing,
  deleteListing,
  addAvailability,
  getMyListings,
};

export default listingService;
