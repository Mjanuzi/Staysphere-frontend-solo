import { useListingsApi } from "./useListingsApi";

/**
 * Custom hook for accessing and managing the current user's listings
 * @param {boolean} fetchOnMount - Whether to fetch listings when component mounts
 * @returns {Object} User's listings data and management functions
 */
export const useMyListings = (fetchOnMount = true) => {
  const { listings, loading, error, fetchMyListings } = useListingsApi({
    enabled: fetchOnMount,
    type: "my",
  });

  return {
    listings,
    loading,
    error,
    fetchMyListings,
  };
};

export default useMyListings;