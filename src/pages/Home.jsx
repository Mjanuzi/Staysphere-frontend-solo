import React from "react";
import { useNavigate } from "react-router-dom";
import { useListings } from "../hooks/useListings";
import "./Home.css";

const Home = () => {
  const navigate = useNavigate();
  // Use the listings hook with initial fetch enabled
  const { listings, loading, error, fetchListings } = useListings(true);

  // Take only the first 3 listings for the featured section
  const featuredListings = listings.slice(0, 3);

  // Helper function to generate image URL based on the listing
  const getImageUrl = (listing) => {
    // Use the first image from the listingImages array if available
    if (listing && listing.listingImages && listing.listingImages.length > 0) {
      return listing.listingImages[0];
    }
    // Fallback to a default image if none are provided
    return "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=500&auto=format&fit=crop";
  };

  const handleRefresh = () => {
    fetchListings();
  };

  const navigateToDetail = (listingId) => {
    navigate(`/listings/${listingId}`);
  };

  return (
    <div className="home-page">
      <h1>Featured Listings</h1>

      {loading ? (
        <div className="loading-state">Loading featured listings...</div>
      ) : error ? (
        <div className="error-state">
          <p>{error}</p>
          <button onClick={handleRefresh}>Try Again</button>
        </div>
      ) : (
        <div className="listings-grid">
          {featuredListings.length > 0 ? (
            featuredListings.map((listing) => (
              <div
                key={listing.listingId || Math.random()}
                className="listing-card"
                onClick={() => navigateToDetail(listing.listingId)}
              >
                <img
                  src={getImageUrl(listing)}
                  alt={listing.listingTitle || "Listing"}
                  className="listing-card-image"
                />
                <div className="listing-card-content">
                  <h3 className="listing-card-title">
                    {listing.listingTitle || "Unnamed Listing"}
                  </h3>
                  <div className="listing-card-location">
                    {listing.location || "Location not specified"}
                    <div className="listing-card-rating">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {listing.hostRating || "4.8"}
                    </div>
                  </div>
                  <div className="listing-card-type">
                    {listing.listingType || "Private host"}
                  </div>
                  <div className="listing-card-dates">
                    {listing.dates || "Available Now"}
                  </div>
                  <div className="listing-card-price">
                    {listing.listingPricePerNight
                      ? `${listing.listingPricePerNight} kr/natt`
                      : "Price not specified"}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p>No featured listings available right now.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Home;
