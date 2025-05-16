import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useListingsApi } from "../hooks/useListingsApi";

import "./Profile.css";

const Profile = () => {
  const { currentUser, userId, loading, logout } = useAuth();
  const navigate = useNavigate();

  const {
    listings: userListings,
    loading: listingsLoading,
    getHostListings,
    deleteListing,
    isDeleting,
    error: listingsError,
  } = useListingsApi(false);
  // Local state for listings and delete modal
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [listingToDelete, setListingToDelete] = useState(null);
  const [deleteError, setDeleteError] = useState(null);

  // Fetch user's bookings and listings when component mounts
  useEffect(() => {
    if (currentUser && userId) {
      // For listings, we need to use the userId (which is the hostId for listings)
      getHostListings(userId).then((data) => {
        if (Array.isArray(data)) {
          setUserListings(data);
        }
      });

      console.log("Fetching listings for user ID:", userId);
    }
  }, [currentUser, userId, getHostListings]);

  // Helper to set user listings from the hook response
  const [userListingsState, setUserListings] = useState([]);

  const navigateToDetail = (listingId) => {
    navigate(`/listings/${listingId}`);
  };

  const navigateToCreateListing = () => {
    navigate("/create-listing");
  };

  const navigateToUpdateListing = (e, listingId) => {
    e.stopPropagation(); // Prevent click from bubbling to the parent
    navigate(`/update-listing/${listingId}`);
  };

  const navigateToAddAvailability = (e, listingId) => {
    e.stopPropagation(); // Prevent click from bubbling to the parent
    navigate(`/add-availability/${listingId}`);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handleDeleteClick = (e, listingId) => {
    e.stopPropagation();
    setListingToDelete(listingId);
    setShowDeleteConfirm(true);
    setDeleteError(null);
  };

  const handleDeleteConfirm = async () => {
    if (!listingToDelete) {
      setDeleteError("Listing ID is missing.");
      return;
    }
    try {
      await deleteListing(listingToDelete);
      setUserListings((prev) =>
        prev.filter((l) => l.listingId !== listingToDelete)
      );
      setShowDeleteConfirm(false);
      setListingToDelete(null);
      setDeleteError(null);
    } catch (err) {
      setDeleteError(
        err?.response?.data?.message ||
          "Failed to delete listing. Please try again."
      );
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
    setListingToDelete(null);
    setDeleteError(null);
  };
  // Handle loading state
  if (loading) {
    return <div className="loading-state">Loading profile...</div>;
  }

  // Safety check in case currentUser is null or undefined
  if (!currentUser) {
    return (
      <div className="error-state">
        User information not available. Please log in again.
      </div>
    );
  }

  // Handle the roles display, which could be an array or set from the backend
  const displayRoles = () => {
    if (!currentUser.roles) return "Standard User";

    if (Array.isArray(currentUser.roles)) {
      return currentUser.roles.join(", ");
    }

    if (typeof currentUser.roles === "object") {
      return Object.values(currentUser.roles).join(", ");
    }

    return String(currentUser.roles);
  };

  return (
    <div className="profile-container">
      <h1>Your Profile</h1>

      <div className="profile-card">
        <h2>Account Information</h2>
        <div className="profile-field">
          <span className="field-label">Username:</span>
          <span className="field-value">
            {currentUser.username || "Not available"}
          </span>
        </div>

        <div className="profile-field">
          <span className="field-label">Role:</span>
          <span className="field-value">{displayRoles()}</span>
        </div>

        {currentUser.email && (
          <div className="profile-field">
            <span className="field-label">Email:</span>
            <span className="field-value">{currentUser.email}</span>
          </div>
        )}

        {currentUser.country && (
          <div className="profile-field">
            <span className="field-label">Country:</span>
            <span className="field-value">{currentUser.country}</span>
          </div>
        )}

        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {/* User's Listings Section with Create Button */}
      <div className="profile-card">
        <div className="section-header">
          <h2>My Listings</h2>
          <button className="create-button" onClick={navigateToCreateListing}>
            Create New Listing
          </button>
        </div>

        {listingsLoading ? (
          <div className="loading-state">Loading listings...</div>
        ) : userListingsState.length > 0 ? (
          <div className="listings-list">
            {userListingsState.map((listing) => (
              <div
                key={listing.listingId || Math.random()}
                className="listing-item"
                onClick={() => navigateToDetail(listing.listingId)}
              >
                <h3>{listing.listingTitle || "Unnamed Listing"}</h3>
                <div className="listing-details">
                  <p>
                    <strong>Location:</strong>{" "}
                    {listing.location || "Unknown location"}
                  </p>
                  <p>
                    <strong>Price:</strong> $
                    {listing.listingPricePerNight?.toFixed(2) || "N/A"} per
                    night
                  </p>
                  <p>
                    <strong>Status:</strong> {listing.listingStatus || "Active"}
                  </p>
                </div>
                <div className="listing-actions">
                  <button
                    className="action-button update-button"
                    onClick={(e) =>
                      navigateToUpdateListing(e, listing.listingId)
                    }
                  >
                    Update
                  </button>
                  <button
                    className="action-button availability-button"
                    onClick={(e) =>
                      navigateToAddAvailability(e, listing.listingId)
                    }
                  >
                    Add Availability
                  </button>
                  <button
                    className="action-button delete-button"
                    onClick={(e) => handleDeleteClick(e, listing.listingId)}
                  >
                    Delete
                  </button>
                </div>
                <div className="view-listing-badge">View Details</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-items-container">
            <p className="no-items">You don't have any listings yet.</p>
            <p className="create-prompt">
              Create your first listing to get started!
            </p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Confirm Deletion</h3>
            <p>Are you sure you want to delete this listing?</p>
            {deleteError && <div className="error-message">{deleteError}</div>}
            <div className="modal-actions">
              <button
                className="confirm-button"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Confirm"}
              </button>
              <button
                className="cancel-button"
                onClick={handleDeleteCancel}
                disabled={isDeleting}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
