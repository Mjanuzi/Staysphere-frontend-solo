import { useListingsApi } from "./useListingsApi";

/**
 * Custom hook for accessing and managing listings data
 * This version maintains backward compatibility while using the new React Query-based implementation
 *
 * @param {boolean} fetchOnMount - Whether to fetch listings when component mounts
 * @returns {Object} Listings data and management functions
 */
export const useListings = (fetchOnMount = true) => {
  // Use the new consolidated hook with compatible options
  const { listings, loading, error, fetchListings, getHostListings } =
    useListingsApi({
      enabled: fetchOnMount,
      type: "all",
    });

  return {
    listings,
    loading,
    error,
    fetchListings,
    getHostListings,
  };
};

export default useListings;
