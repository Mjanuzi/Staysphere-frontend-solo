import { useListingsApi } from "./useListingsApi";

/**
 * Custom hook for accessing paginated listings data using React Query
 * Provides infinite scrolling functionality with improved caching
 * This version maintains backward compatibility while using the new consolidated implementation
 *
 * @param {number} pageSize - Number of items per page
 * @returns {Object} Paginated listings data and pagination control functions
 */
export const usePaginatedListingsQuery = (pageSize = 10) => {
  // Use the new consolidated hook with pagination enabled
  const { listings, loading, error, hasMore, loadMore, reset } = useListingsApi(
    {
      enabled: true,
      paginated: true,
      pageSize,
    }
  );

  return {
    listings,
    loading,
    error,
    hasMore,
    loadMore,
    reset,
  };
};

export default usePaginatedListingsQuery;
