import { useListingsApi } from "./useListingsApi";

/**
 * Custom hook for accessing and managing listings data using React Query
 * This version maintains backward compatibility while using the new consolidated implementation
 *
 * @param {boolean} enabled - Whether to enable the query (default: true)
 * @returns {Object} Listings data and management functions
 */
export const useListingsQuery = (enabled = true) => {
  // Use the new consolidated hook with compatible options
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
