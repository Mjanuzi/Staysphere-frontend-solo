import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./useAuth";
import api from "../api/axios";

/**
 * hook for accessing and managing the current user's listings
 *
 * @param {boolean} fetchOnMount - fetch listings when component mounts
 * @returns {Object} User's listings data and management functions
 */
export const useMyListings = (fetchOnMount = true) => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { userId, currentUser } = useAuth();

  /**
   * Fetch the current user's listings
   */
  const fetchMyListings = useCallback(async () => {
    if (!userId) {
      console.warn("User ID is required for fetchMyListings");
      setListings([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log(`Fetching listings for current user with ID: ${userId}`);
      const response = await api.get(`/api/listing/gethostbyid/${userId}`);
      console.log("My listings response:", response.data);
      setListings(response.data);
    } catch (err) {
      console.error("Error in useMyListings:", err);
      if (err.response) {
        console.error("Response status:", err.response.status);
        console.error("Response data:", err.response.data);
      }
      setError(err.message || "Failed to fetch your listings");
      setListings([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Fetch listings on mount
  useEffect(() => {
    if (fetchOnMount && userId) {
      fetchMyListings();
    }
  }, [fetchOnMount, userId, fetchMyListings]);

  // Refresh listings when user changes
  useEffect(() => {
    if (userId) {
      fetchMyListings();
    } else {
      setListings([]);
    }
  }, [userId, currentUser, fetchMyListings]);

  return {
    listings,
    loading,
    error,
    fetchMyListings,
  };
};

export default useMyListings;
