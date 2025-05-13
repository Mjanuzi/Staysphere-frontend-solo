import React from "react";
import { useNavigate } from "react-router-dom";
import { usePaginatedListings } from "../hooks/usePaginatedListings";
import InfiniteScroll from "react-infinite-scroll-component";
import "./Listings.css";

/**Listing page
 * Display all listings, fetching data from backend
 */

const Listings = () => {
  const navigate = useNavigate();
  //Using the listings hook
  const { listings, loading, hasMore, loadMore, reset } =
    usePaginatedListings(true);
};

// Helper function to generate image URL based on the listing
const getImageUrl = (listing) => {
  if (!listing) {
    return "/src/assets/no-img-pic.png";
  }
};

//When refreshing the page, fetching all listings
const handleRefresh = () => {
  fetchListings();
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
        {/**Refresh page on click */}
        Refresh Listings
      </button>
    </div>
    {/**handle errors with refresh button */}
    {error && (
      <div className="error-state">
        <p>{error}</p>
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
          <div className="listings.loader">
            <div className="loading-indicator">Loading more listings...</div>
          </div>
        }
      >
        


      </InfiniteScroll>
    )}
  </div>
);
