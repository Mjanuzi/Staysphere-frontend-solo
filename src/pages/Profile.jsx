// Profile.jsx (partial)
import { useState, useEffect } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import bookingService from "../api/bookingService";
import listingService from "../api/listingService";
import "./Profile.css";

const Profile = () => {
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("bookings");
  const [bookings, setBookings] = useState([]);
  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Redirect if not authenticated
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);

        // Fetch data based on active tab
        if (activeTab === "bookings") {
          const data = await bookingService.getUserBookings(currentUser.id);
          setBookings(data);
        } else if (
          activeTab === "listings" &&
          currentUser.roles.includes("HOST")
        ) {
          const data = await listingService.getUserListings(currentUser.id);
          setListings(data);
        }

        setError(null);
      } catch (err) {
        console.error(`Failed to fetch user ${activeTab}:`, err);
        setError(`Failed to load your ${activeTab}. Please try again.`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [activeTab, currentUser.id, currentUser.roles]);

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="user-info">
          <div className="user-avatar">
            {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : "U"}
          </div>
          <div className="user-details">
            <h1 className="user-name">{currentUser.name}</h1>
            <p className="user-email">{currentUser.email}</p>
          </div>
        </div>
        <button className="logout-button" onClick={logout}>
          Logout
        </button>
      </div>

      <div className="profile-tabs">
        <button
          className={`profile-tab ${activeTab === "bookings" ? "active" : ""}`}
          onClick={() => setActiveTab("bookings")}
        >
          My Bookings
        </button>

        {currentUser.roles.includes("HOST") && (
          <button
            className={`profile-tab ${
              activeTab === "listings" ? "active" : ""
            }`}
            onClick={() => setActiveTab("listings")}
          >
            My Listings
          </button>
        )}

        <button
          className={`profile-tab ${activeTab === "account" ? "active" : ""}`}
          onClick={() => setActiveTab("account")}
        >
          Account Settings
        </button>
      </div>

      <div className="profile-content">
        {isLoading ? (
          <div className="loading-indicator">Loading...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : (
          <>
            {activeTab === "bookings" && (
              <div className="bookings-section">
                <h2 className="section-title">Your Bookings</h2>
                {bookings.length === 0 ? (
                  <div className="empty-state">
                    <p>You don't have any bookings yet.</p>
                    <Link to="/listings" className="action-button">
                      Explore Listings
                    </Link>
                  </div>
                ) : (
                  <div className="bookings-list">
                    {bookings.map((booking) => (
                      <div key={booking.id} className="booking-card">
                        {/* Booking card content */}
                        <h3>{booking.listing.title}</h3>
                        <p>
                          {booking.checkInDate} to {booking.checkOutDate}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "listings" && (
              <div className="listings-section">
                <div className="section-header">
                  <h2 className="section-title">Your Listings</h2>
                  <Link to="/listings/create" className="create-button">
                    Create New Listing
                  </Link>
                </div>
                {listings.length === 0 ? (
                  <div className="empty-state">
                    <p>You don't have any listings yet.</p>
                    <Link to="/listings/create" className="action-button">
                      Create Your First Listing
                    </Link>
                  </div>
                ) : (
                  <div className="listings-grid">
                    {listings.map((listing) => (
                      <div key={listing.id} className="listing-card">
                        {/* Listing card content */}
                        <h3>{listing.title}</h3>
                        <p>${listing.pricePerNight} per night</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "account" && (
              <div className="account-section">
                <h2 className="section-title">Account Settings</h2>
                <div className="account-form">
                  <div className="form-group">
                    <label>Name</label>
                    <input type="text" value={currentUser.name} disabled />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input type="email" value={currentUser.email} disabled />
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Profile;