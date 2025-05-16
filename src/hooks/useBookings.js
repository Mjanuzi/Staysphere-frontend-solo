import { useBookingsApi } from "./useBookingsApi";

/**
 * Custom hook for accessing and managing booking data
 * This version maintains backward compatibility while using the new React Query-based implementation
 *
 * @param {boolean} fetchOnMount - Whether to fetch bookings when component mounts
 * @returns {Object} Bookings data and management functions
 */
export const useBookings = (fetchOnMount = false) => {
  // Use the new consolidated hook with compatible options
  const {
    bookings,
    loading,
    error,
    fetchAllBookings,
    fetchUserBookings,
    fetchHostBookings,
    createBooking,
  } = useBookingsApi({
    enabled: fetchOnMount,
    type: "all",
  });

  return {
    bookings,
    loading,
    error,
    fetchAllBookings,
    fetchUserBookings,
    fetchHostBookings,
    createBooking,
  };
};

export default useBookings;
