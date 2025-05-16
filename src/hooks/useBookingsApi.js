import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { useAuth } from "./useAuth";
import api from "../api/axios";

/**
 * hook for accessing and managing booking data using React Query
 * Provides better caching and performance than the original useBookings hook
 *
 * @param {Object} options - Configuration options
 * @param {boolean} options.enabled - Whether to enable automatic data fetching
 * @param {string} options.type - Type of bookings to fetch ('all', 'user', 'host')
 * @returns {Object} Bookings data and management functions
 */
export const useBookingsApi = (options = {}) => {
  const { enabled = true, type = "all" } = options;
  const queryClient = useQueryClient();
  const { userId, currentUser } = useAuth();

  /**
   * Hook for fetching all bookings (admin only)
   */
  const useAllBookings = () => {
    return useQuery({
      queryKey: ["bookings", "all"],
      queryFn: async () => {
        try {
          const response = await api.get("/bookings/all");
          return response.data;
        } catch (err) {
          console.error("Error fetching all bookings:", err);
          throw new Error(err.message || "Failed to fetch bookings");
        }
      },
      enabled: enabled && type === "all",
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
          const response = await api.get(`/bookings/user/${userId}`);
          return response.data;
        } catch (err) {
          console.error(`Error fetching bookings for user ${userId}:`, err);
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
          const response = await api.get(`/bookings/host/${hostId}`);
          return response.data;
        } catch (err) {
          console.error(`Error fetching bookings for host ${hostId}:`, err);
          throw new Error(err.message || "Failed to fetch host bookings");
        }
      },
      enabled: enabled && Boolean(hostId) && type === "host",
    });
  };

  /**
   * Mutation for creating a new booking
   */
  const createBookingMutation = useMutation({
    mutationFn: async (bookingData) => {
      const response = await api.post("/bookings", bookingData);
      return response.data;
    },
    onSuccess: (data) => {
      // Invalidate relevant queries to refetch data
      queryClient.invalidateQueries({ queryKey: ["bookings"] });

      // If we have user data, invalidate user-specific bookings
      if (currentUser?.username) {
        queryClient.invalidateQueries({
          queryKey: ["bookings", "user", currentUser.username],
        });
      }

      // If we have a host ID in the created booking, invalidate host bookings
      if (data?.hostId) {
        queryClient.invalidateQueries({
          queryKey: ["bookings", "host", data.hostId],
        });
      }
    },
  });

  /**
   * Mutation for updating a booking
   */
  const updateBookingMutation = useMutation({
    mutationFn: async ({ bookingId, bookingData }) => {
      const response = await api.patch(`/bookings/${bookingId}`, bookingData);
      return response.data;
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
    },
  });

  /**
   * Get a specific booking by ID
   */
  const useBookingById = (bookingId) => {
    return useQuery({
      queryKey: ["booking", bookingId],
      queryFn: async () => {
        if (!bookingId) {
          throw new Error("Booking ID is required");
        }

        const response = await api.get(`/bookings/${bookingId}`);
        return response.data;
      },
      enabled: enabled && Boolean(bookingId),
    });
  };

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
            queryFn: async () => {
              const response = await api.get(`/bookings/user/${userId}`);
              return response.data;
            },
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
            queryFn: async () => {
              const response = await api.get(`/bookings/host/${hostId}`);
              return response.data;
            },
          });
        },
        [queryClient]
      ),
      refetch,
    };
  } else {
    // Use all bookings
    const { data, isLoading, error, refetch } = useAllBookings();

    hookResult = {
      bookings: data || [],
      loading: isLoading,
      error,
      fetchAllBookings: refetch,

      // Maintain compatibility with original hook
      fetchUserBookings: useCallback(
        (userId) => {
          if (!userId) return Promise.resolve([]);

          return queryClient.fetchQuery({
            queryKey: ["bookings", "user", userId],
            queryFn: async () => {
              const response = await api.get(`/bookings/user/${userId}`);
              return response.data;
            },
          });
        },
        [queryClient]
      ),

      fetchHostBookings: useCallback(
        (hostId) => {
          if (!hostId) return Promise.resolve([]);

          return queryClient.fetchQuery({
            queryKey: ["bookings", "host", hostId],
            queryFn: async () => {
              const response = await api.get(`/bookings/host/${hostId}`);
              return response.data;
            },
          });
        },
        [queryClient]
      ),
    };
  }

  // Add mutations to result
  return {
    ...hookResult,
    createBooking: createBookingMutation.mutate,
    updateBooking: updateBookingMutation.mutate,
    isCreating: createBookingMutation.isPending,
    isUpdating: updateBookingMutation.isPending,
    useBookingById,
  };
};

export default useBookingsApi;
