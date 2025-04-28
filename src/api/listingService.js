import api from "./axios";

// hämta alla listings
export const getAllListings = async () => {
  const response = await api.get("/listings");
  return response.data;
};

// hämta en listing med ID ifrån annonsflöde
export const getListingById = async (id) => {
  const response = await api.get(`/listings/${id}`);
  return response.data;
};

// hämta listings för en host
export const getListingsByHostId = async (id) => {
    const response = await api.get(`/listings/${id}`);
    return response.data;
  };
