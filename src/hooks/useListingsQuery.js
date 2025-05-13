import { useListingsApi } from "./useListingsApi";

/**
 * hook for accessing and managing listings data using React Query
 *
 * @param {boolean} enabled - Whether to enable the query (default: true)
 * @returns {Object} Listings data and management functions
 */
export const useListingsQuery = (enabled = true) => {
  const {
    listings,
    loading,
    error,
    fetchListings,
    getHostListings,
    useListingById,
  } = useListingsApi({
    enabled,
    type: "all",
  });

  return {
    listings,
    loading,
    error,
    fetchListings,
    getHostListings,
    useListingById,
  };
};

export default useListingsQuery;
