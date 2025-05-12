import React from "react";
import { useNavigate } from "react-router-dom";
import { useListings } from "../hooks/useListings";
import "./Listings.css";

/**Listing page
 * Display all listings, fetching data from backend
 */

const Listings = () => {
  const navigate = useNavigate();
  //Using the listings hook
  const { listings, loading, error, fetchListings } = useListings(true);
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
if (loading) {
  return <div className="loading-state">Loading listings...</div>;
}

return (
  <div className="listings-page">
    <div className="listings-header">
      <h1>All Listings</h1>
      <button className="refresh-button" onClick={handleRefresh}>{/**Refresh page on click */}
        Refresh Listings
      </button>
    </div>
  </div>
);
