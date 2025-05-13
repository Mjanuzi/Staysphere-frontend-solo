import { useListingsApi } from "./useListingsApi";

/**
 * hook for accessing and managing listings data
 *
 * @param {boolean} fetchOnMount - Whether to fetch listings when component mounts
 * @returns {Object} Listings data and management functions
 */
export const useListings = (fetchOnMount = true) => {
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
