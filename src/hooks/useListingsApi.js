import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { useCallback } from "react";
import { useAuth } from "./useAuth";
import api from "../api/axios";

/**
 * Consolidated hook for accessing and managing listings data using React Query
 * Combines functionality from useListings, useListingsQuery, and useMyListings
 *
 * @param {Object} options - Configuration options
 * @param {boolean} options.enabled - Whether to enable the automatic data fetching
 * @param {boolean} options.paginated - Whether to use pagination
 * @param {number} options.pageSize - Number of items per page (when paginated)
 * @param {string} options.type - Type of listings to fetch ('all', 'my', 'host')
 * @returns {Object} Listings data and management functions
 */
export const useListingsApi = (options = {}) => {
  const {
    enabled = true,
    paginated = false,
    pageSize = 10,
    type = "all",
  } = options;

  const queryClient = useQueryClient();
  const { userId, currentUser } = useAuth();

  // Base hook for fetching all listings
  const useAllListings = () => {
    return useQuery({
      queryKey: ["listings"],
      queryFn: async () => {
        try {
          const response = await api.get("/api/listing/getall");
          return response.data;
        } catch (err) {
          console.error("Error fetching listings:", err);
          throw new Error(err.message || "Failed to fetch listings");
        }
      },
      enabled: enabled && type === "all",
    });
  };

  // Hook for fetching listings for a specific host
  const useHostListings = (hostId) => {
    return useQuery({
      queryKey: ["listings", "host", hostId],
      queryFn: async () => {
        if (!hostId) {
          throw new Error("Host ID is required");
        }

        console.log(`Fetching listings for host with ID: ${hostId}`);
        try {
          const response = await api.get(`/api/listing/gethostbyid/${hostId}`);
          console.log("Host listings response:", response.data);
          return response.data;
        } catch (err) {
          console.error(
            `Error fetching listings for host with ID ${hostId}:`,
            err
          );
          if (err.response) {
            console.error("Response status:", err.response.status);
            console.error("Response data:", err.response.data);
          }
          throw new Error(err.message || "Failed to fetch host listings");
        }
      },
      enabled: enabled && Boolean(hostId) && (type === "host" || type === "my"),
    });
  };

  // Hook for fetching my listings (current user's listings)
  const useMyListings = () => {
    return useHostListings(userId);
  };

  // Hook for fetching a single listing by ID
  const useListingById = (listingId) => {
    return useQuery({
      queryKey: ["listing", listingId],
      queryFn: async () => {
        const response = await api.get(`/api/listing/getbyid/${listingId}`);
        return response.data;
      },
      enabled: enabled && Boolean(listingId),
    });
  };

  // Hook for paginated listings with infinite scroll
  const usePaginatedListings = () => {
    return useInfiniteQuery({
      queryKey: ["paginatedListings"],
      queryFn: async ({ pageParam = 0 }) => {
        try {
          const response = await api.get("/api/listing/getall");
          const allListings = response.data || [];

          // Simulate pagination by slicing the data
          const startIndex = pageParam * pageSize;
          const endIndex = startIndex + pageSize;
          const paginatedData = allListings.slice(startIndex, endIndex);

          return {
            listings: paginatedData,
            nextPage: allListings.length > endIndex ? pageParam + 1 : undefined,
          };
        } catch (err) {
          console.error("Error in paginated listings:", err);
          throw new Error(err.message || "Failed to fetch listings");
        }
      },
      getNextPageParam: (lastPage) => lastPage.nextPage,
      staleTime: 5 * 60 * 1000, // 5 minutes
      enabled: enabled && paginated,
    });
  };

  // Mutation for creating a new listing
  const createListingMutation = useMutation({
    mutationFn: async (listingData) => {
      const response = await api.post("/api/listing/create", listingData);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate relevant queries to refetch data
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      if (userId) {
        queryClient.invalidateQueries({
          queryKey: ["listings", "host", userId],
        });
      }
    },
  });

  // Mutation for updating a listing
  const updateListingMutation = useMutation({
    mutationFn: async ({ listingId, listingData }) => {
      const response = await api.patch(
        `/api/listing/patch/${listingId}`,
        listingData
      );
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      queryClient.invalidateQueries({
        queryKey: ["listing", variables.listingId],
      });
      if (userId) {
        queryClient.invalidateQueries({
          queryKey: ["listings", "host", userId],
        });
      }
    },
  });

  // Choose which hook to use based on options
  let hookResult;

  if (paginated) {
    // Use paginated listings
    const {
      data,
      fetchNextPage,
      hasNextPage,
      isFetchingNextPage,
      isLoading,
      isError,
      error,
      refetch,
    } = usePaginatedListings();

    // Flatten all pages of data into a single listings array
    const listings = data?.pages.flatMap((page) => page.listings) || [];

    hookResult = {
      listings,
      loading: isLoading,
      error: isError ? error : null,
      hasMore: !!hasNextPage,
      loadMore: useCallback(() => {
        if (!isFetchingNextPage && hasNextPage) {
          fetchNextPage();
        }
      }, [fetchNextPage, hasNextPage, isFetchingNextPage]),
      reset: refetch,
    };
  } else if (type === "my" && userId) {
    // Use my listings
    const { data, isLoading, error, refetch } = useMyListings();

    hookResult = {
      listings: data || [],
      loading: isLoading,
      error,
      fetchMyListings: refetch,
    };
  } else if (type === "host") {
    // Create a function that can fetch host listings
    const getHostListings = useCallback(
      async (hostId) => {
        if (!hostId) {
          console.error("No hostId provided to getHostListings");
          return [];
        }

        try {
          await queryClient.fetchQuery({
            queryKey: ["listings", "host", hostId],
            queryFn: async () => {
              const response = await api.get(
                `/api/listing/gethostbyid/${hostId}`
              );
              return response.data;
            },
          });

          return queryClient.getQueryData(["listings", "host", hostId]) || [];
        } catch (err) {
          console.error(
            `Error fetching listings for host with ID ${hostId}:`,
            err
          );
          return [];
        }
      },
      [queryClient]
    );

    // Return simple interface compatible with useListings
    hookResult = {
      listings: [],
      loading: false,
      error: null,
      getHostListings,
    };
  } else {
    // Use all listings
    const { data, isLoading, error, refetch } = useAllListings();

    hookResult = {
      listings: data || [],
      loading: isLoading,
      error,
      fetchListings: refetch,
      getHostListings: useCallback(
        async (hostId) => {
          if (!hostId) return [];

          try {
            await queryClient.fetchQuery({
              queryKey: ["listings", "host", hostId],
              queryFn: async () => {
                const response = await api.get(
                  `/api/listing/gethostbyid/${hostId}`
                );
                return response.data;
              },
            });

            return queryClient.getQueryData(["listings", "host", hostId]) || [];
          } catch (err) {
            console.error(
              `Error fetching listings for host with ID ${hostId}:`,
              err
            );
            return [];
          }
        },
        [queryClient]
      ),
      useListingById, // Include the single listing hook
    };
  }

  // Add mutation functions to all return types
  return {
    ...hookResult,
    createListing: createListingMutation.mutate,
    updateListing: updateListingMutation.mutate,
    isCreating: createListingMutation.isPending,
    isUpdating: updateListingMutation.isPending,
  };
};

export default useListingsApi;
