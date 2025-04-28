import api from "./axios";

// hämta alla bookings
export const getAllBookings = async () => {
  const response = await api.get("/bookings");
  return response.data;
};

// hämta en booking med ID vid behov
export const getBookingById = async (id) => {
  const response = await api.get(`/bookings/${id}`);
  return response.data;
};

// hämta bookings för en host
export const getHostBookings = async (id) => {
    const response = await api.get(`/bookings/${id}`);
    return response.data;
  };

// hämta bookings för en user
export const getUserBookings = async (id) => {
    const response = await api.get(`/bookings/${id}`);
    return response.data;
  };