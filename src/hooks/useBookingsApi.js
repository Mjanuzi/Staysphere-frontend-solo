import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { useAuth } from "./useAuth";
import {
  createBooking,
  getUserBookings,
  getHostBookings,
  getListingBookings,
  updateBookingStatus,
  getAllBookings,
  getBookingById,
} from "../api/bookingsService";

/**
 * Custom hook for accessing and managing booking data using React Query
 * Provides better caching and performance than the original useBookings hook
 *
 * @param {Object} options - Configuration options
 * @param {boolean} options.enabled - Whether to enable automatic data fetching
 * @param {string} options.type - Type of bookings to fetch ('all', 'user', 'host')
 * @returns {Object} Bookings data and management functions
 */
export const useBookingsApi = (options = {}) => {
  const { enabled = true, type = "none" } = options;
  const queryClient = useQueryClient();
  const { userId, currentUser } = useAuth();

  /**
   * Hook for fetching all bookings (admin only)
   */
  const useAllBookings = () => {
    // Only enable this query if the user has ADMIN role
    const isAdmin = currentUser?.roles?.includes("ADMIN");

    return useQuery({
      queryKey: ["bookings", "all"],
      queryFn: async () => {
        try {
          // If not admin, return empty array instead of making the request
          if (!isAdmin) {
            return [];
          }

          return await getAllBookings();
        } catch (err) {
          throw new Error(err.message || "Failed to fetch bookings");
        }
      },
      enabled: enabled && type === "all" && isAdmin, // Only enable for admins
    });
  };

  /**
   * Hook for fetching bookings for a specific user
   */
  const useUserBookings = (userId) => {
    return useQuery({
      queryKey: ["bookings", "user", userId],
      queryFn: async () => {
        if (!userId) {
          throw new Error("User ID is required");
        }

        try {
          return await getUserBookings(userId);
        } catch (err) {
          throw new Error(err.message || "Failed to fetch your bookings");
        }
      },
      enabled: enabled && Boolean(userId) && type === "user",
    });
  };

  /**
   * Hook for fetching bookings for a specific host
   */
  const useHostBookings = (hostId) => {
    return useQuery({
      queryKey: ["bookings", "host", hostId],
      queryFn: async () => {
        if (!hostId) {
          throw new Error("Host ID is required");
        }

        try {
          return await getHostBookings(hostId);
        } catch (err) {
          throw new Error(err.message || "Failed to fetch host bookings");
        }
      },
      enabled: enabled && Boolean(hostId) && type === "host",
    });
  };

  /**
   * Hook for fetching a specific booking by ID
   */
  const useBookingById = (bookingId) => {
    return useQuery({
      queryKey: ["booking", bookingId],
      queryFn: async () => {
        if (!bookingId) {
          throw new Error("Booking ID is required");
        }

        return await getBookingById(bookingId);
      },
      enabled: enabled && Boolean(bookingId),
    });
  };

  /**
   * Hook for fetching bookings for a specific listing
   */
  const useListingBookings = (listingId) => {
    return useQuery({
      queryKey: ["listings", listingId, "bookings"],
      queryFn: async () => {
        if (!listingId) {
          throw new Error("Listing ID is required");
        }
        return await getListingBookings(listingId);
      },
      enabled: Boolean(listingId),
    });
  };

  /**
   * Mutation for creating a new booking
   */
  const createBookingMutation = useMutation({
    mutationFn: createBooking,
    onSuccess: (data, variables) => {
      // Invalidate relevant queries to refetch data
      queryClient.invalidateQueries({ queryKey: ["bookings"] });

      // Always invalidate user bookings for the current user
      if (userId || currentUser?.username) {
        const targetUserId = userId || currentUser?.username;
        queryClient.invalidateQueries({
          queryKey: ["bookings", "user", targetUserId],
        });
      }

      // Always invalidate listing bookings for the listing in the booking data
      if (variables.listingId) {
        // Invalidate the specific listing to refresh available dates
        queryClient.invalidateQueries({
          queryKey: ["listing", variables.listingId],
        });

        // Invalidate listing bookings
        queryClient.invalidateQueries({
          queryKey: ["listings", variables.listingId, "bookings"],
        });

        // Invalidate all listings to refresh the listings page
        queryClient.invalidateQueries({
          queryKey: ["listings"],
        });
      }

      // Store a flag in sessionStorage to indicate a booking was just made
      // This will be used to force refresh when revisiting a listing
      sessionStorage.setItem("justBooked", "true");
      sessionStorage.setItem("bookedListingId", variables.listingId);
    },
  });

  /**
   * Mutation for updating a booking
   */
  const updateBookingMutation = useMutation({
    mutationFn: ({ bookingId, bookingData }) => {
      // Verify that we have all required fields for the booking update
      if (!bookingData.startDate || !bookingData.endDate) {
        throw new Error("Missing required booking data");
      }

      return updateBookingStatus(bookingId, bookingData);
    },
    onSuccess: (data, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["bookings"] });

      // Invalidate specific booking
      queryClient.invalidateQueries({
        queryKey: ["booking", variables.bookingId],
      });

      // If we have user data, invalidate user-specific bookings
      if (currentUser?.username) {
        queryClient.invalidateQueries({
          queryKey: ["bookings", "user", currentUser.username],
        });
      }

      // Also invalidate listing bookings if we have listingId
      if (variables.bookingData && variables.bookingData.listingId) {
        queryClient.invalidateQueries({
          queryKey: ["listings", variables.bookingData.listingId, "bookings"],
        });
      }
    },
  });

  // Determine which hook to use based on options
  let hookResult;

  if (type === "user" && (userId || currentUser?.username)) {
    // Use user's bookings
    const targetUserId = currentUser?.username || userId;
    const { data, isLoading, error, refetch } = useUserBookings(targetUserId);

    hookResult = {
      bookings: data || [],
      loading: isLoading,
      error,
      fetchUserBookings: useCallback(
        (userId) => {
          if (!userId) return Promise.resolve([]);

          return queryClient.fetchQuery({
            queryKey: ["bookings", "user", userId],
            queryFn: () => getUserBookings(userId),
          });
        },
        [queryClient]
      ),
      refetch,
    };
  } else if (type === "host" && userId) {
    // Use host's bookings
    const { data, isLoading, error, refetch } = useHostBookings(userId);

    hookResult = {
      bookings: data || [],
      loading: isLoading,
      error,
      fetchHostBookings: useCallback(
        (hostId) => {
          if (!hostId) return Promise.resolve([]);

          return queryClient.fetchQuery({
            queryKey: ["bookings", "host", hostId],
            queryFn: () => getHostBookings(hostId),
          });
        },
        [queryClient]
      ),
      refetch,
    };
  } else if (type === "all" && currentUser?.roles?.includes("ADMIN")) {
    // Admin users can see all bookings
    const { data, isLoading, error, refetch } = useAllBookings();

    hookResult = {
      bookings: data || [],
      loading: isLoading,
      error,
      fetchAllBookings: refetch,
    };
  } else {
    // Default case - no automatic data fetching
    hookResult = {
      bookings: [],
      loading: false,
      error: null,
    };
  }

  // Add helper functions regardless of user type
  hookResult = {
    ...hookResult,
    fetchUserBookings: useCallback(
      (userId) => {
        if (!userId) return Promise.resolve([]);

        return queryClient.fetchQuery({
          queryKey: ["bookings", "user", userId],
          queryFn: () => getUserBookings(userId),
        });
      },
      [queryClient]
    ),
    fetchHostBookings: useCallback(
      (hostId) => {
        if (!hostId) return Promise.resolve([]);

        return queryClient.fetchQuery({
          queryKey: ["bookings", "host", hostId],
          queryFn: () => getHostBookings(hostId),
        });
      },
      [queryClient]
    ),
  };

  const fetchListingBookings = useCallback(
    (listingId) => {
      if (!listingId) return Promise.resolve([]);

      return queryClient.fetchQuery({
        queryKey: ["listings", listingId, "bookings"],
        queryFn: () => getListingBookings(listingId),
      });
    },
    [queryClient]
  );

  return {
    ...hookResult,
    createBooking: createBookingMutation.mutate,
    updateBooking: updateBookingMutation.mutate,
    isCreating: createBookingMutation.isPending,
    isUpdating: updateBookingMutation.isPending,
    useBookingById,
    useListingBookings,
    fetchListingBookings,
  };
};

export default useBookingsApi;
