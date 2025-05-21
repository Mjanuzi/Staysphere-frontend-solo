import React from "react";
import { useNavigate } from "react-router-dom";
import { usePaginatedListingsQuery } from "../hooks/usePaginatedListingsQuery";
import InfiniteScroll from "react-infinite-scroll-component";
import "./Listings.css";

/**Listing page
 * Display all listings, fetching data from backend
 */

const Listings = () => {
  const navigate = useNavigate();
  //Using the listings hook
  const { listings, loading, error, hasMore, loadMore, reset } =
    usePaginatedListingsQuery();

  // Helper function to generate image URL based on the listing
  const getImageUrl = (listing) => {
    // a default img url if no images
    const defaultImage =
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=500&auto=format&fit=crop";
    if (!listing) {
      return defaultImage;
    }
    // Check if the listing has images array and it's not empty
    if (listing.listingImages && listing.listingImages.length > 0) {
      return listing.listingImages[0];
    }
    //back to default if no images are found
    return defaultImage;
  };

  //When refreshing the page, fetching all listings
  const handleRefresh = () => {
    reset();
  };

  //navigate to detail - when listingDetail is done
  const navigateToDetail = (listingId) => {
    navigate(`/listings/${listingId}`);
  };

  //while loading
  if (loading && listings.length === 0) {
    return <div className="loading-state">Loading listings...</div>;
  }

  return (
    <div className="listings-page">
      <div className="listings-header">
        <h1>All Listings</h1>
        <button className="refresh-button" onClick={handleRefresh}>
          Refresh Listings
        </button>
      </div>

      {error && (
        <div className="error-state">
          <p>{error.message || "An error occurred while fetching listings."}</p>
          <button onClick={handleRefresh}>Try Again</button>
        </div>
      )}

      {listings.length === 0 ? (
        <p>No listings available at the moment.</p>
      ) : (
        <InfiniteScroll
          dataLength={listings.length}
          next={loadMore}
          hasMore={hasMore}
          loader={
            <div className="listings-loader">
              <div className="loading-indicator">Loading more listings...</div>
            </div>
          }
          endMessage={
            <div className="end-message">
              <b>No more listings to load</b>
            </div>
          }
        >
          <div className="listings-grid">
            {listings
              .filter((listing) => listing.listingActive !== false)
              .map((listing) => (
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
              ))}
          </div>
        </InfiniteScroll>
      )}
    </div>
  );
};

export default Listings;
