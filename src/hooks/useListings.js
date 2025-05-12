import { useState, useCallback } from "react";
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
