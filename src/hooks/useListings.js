import { useState, useEffect, useCallback } from "react";
import api from "../api/axios";

/**
 * Custom hook for accessing and managing listings data
 *
 * @param {boolean} fetchOnMount - Whether to fetch listings when component mounts
 * @returns {Object} Listings data and management functions
 */
export const useListings = (fetchOnMount = true) => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch all listings
   */
  const fetchListings = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get("/api/listing/getall");
      setListings(response.data);
    } catch (err) {
      console.error("Error in useListings:", err);
      setError(err.message || "Failed to fetch listings");
      setListings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch listings for a specific host by user ID
   *
   * @param {string} hostId - ID of the host user
   * @returns {Promise<Array>} Array of listings
   */
  const getHostListings = useCallback(async (hostId) => {
    if (!hostId) {
      console.error("No hostId provided to getHostListings");
      return [];
    }

    setLoading(true);
    setError(null);

    try {
      console.log(`Fetching listings for host with ID: ${hostId}`);
      const response = await api.get(`/api/listing/gethostbyid/${hostId}`);
      console.log("Host listings response:", response.data);
      return response.data;
    } catch (err) {
      console.error(`Error fetching listings for host with ID ${hostId}:`, err);
      if (err.response) {
        console.error("Response status:", err.response.status);
        console.error("Response data:", err.response.data);
      }
      setError(err.message || "Failed to fetch host listings");
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch listings on mount if requested
  useEffect(() => {
    if (fetchOnMount) {
      fetchListings();
    }
  }, [fetchOnMount, fetchListings]);

  return {
    listings,
    loading,
    error,
    fetchListings,
    getHostListings,
  };
};

export default useListings;
