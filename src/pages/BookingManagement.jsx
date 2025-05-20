import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useListingsApi } from "../hooks/useListingsApi";
import { useBookingsApi } from "../hooks/useBookingsApi";
import { format } from "date-fns";
import "./BookingManagement.css";

const BookingManagement = () => {
  const { listingId } = useParams();
  const navigate = useNavigate();
  const { userId } = useAuth();

  // Get listing API functionality
  const { useListingById } = useListingsApi({ enabled: true });

  // Get listing data using React Query
  const { data: listing, isLoading: listingLoading } =
    useListingById(listingId);

  // Bookings API hook
  const {
    fetchListingBookings,
    updateBooking,
    isUpdating,
    error: apiError,
  } = useBookingsApi({ enabled: false, type: "none" });

  // State for bookings
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // State for booking update modal
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [bookingToUpdate, setBookingToUpdate] = useState(null);
  const [updateType, setUpdateType] = useState(null); // 'approve' or 'deny'

  // Fetch bookings for this listing when component mounts
  useEffect(() => {
    const loadBookings = async () => {
      if (!listingId) return;

      try {
        setLoading(true);
        const data = await fetchListingBookings(listingId);
        if (Array.isArray(data)) {
          setBookings(data);
        }
      } catch (err) {
        setError("Failed to load bookings. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadBookings();
  }, [listingId, fetchListingBookings]);

  // Check if the user is the owner
  useEffect(() => {
    if (listing && userId && listing.hostId !== userId) {
      setError("You don't have permission to manage bookings for this listing");
    }
  }, [listing, userId]);

  // Format date for display
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return format(date, "PPP"); // 'Jan 1, 2021' vårt format
    } catch (error) {
      return "Invalid date";
    }
  };

  // Handle booking status update
  const handleUpdateClick = (booking, type) => {
    setBookingToUpdate(booking);
    setUpdateType(type);
    setShowUpdateModal(true);
  };

  // Confirm booking status update
  const handleUpdateConfirm = async () => {
    if (!bookingToUpdate || !updateType) return;

    try {
      // We need to include all required fields, not just status and pending
      // The backend expects all these fields when updating
      const pendingValue = false; // Both approve and deny set pending to false
      const updateData = {
        // Include the original booking data
        userId: bookingToUpdate.userId,
        listingId: bookingToUpdate.listingId,
        bookingName: bookingToUpdate.bookingName,
        bookingDate: bookingToUpdate.bookingDate,
        startDate: bookingToUpdate.startDate,
        endDate: bookingToUpdate.endDate,
        totalCost: bookingToUpdate.totalCost,
        // Update the status values
        status: updateType === "approve",
        pending: pendingValue,
        isPending: pendingValue,
      };

      await updateBooking({
        bookingId: bookingToUpdate.bookingID,
        bookingData: updateData,
      });

      // Update local state
      setBookings((prev) =>
        prev.map((booking) =>
          booking.bookingID === bookingToUpdate.bookingID
            ? {
                ...booking,
                status: updateType === "approve",
                pending: pendingValue,
                isPending: pendingValue,
              }
            : booking
        )
      );

      setSuccessMessage(
        `Booking ${
          updateType === "approve" ? "approved" : "denied"
        } successfully!`
      );
      setShowUpdateModal(false);
      setBookingToUpdate(null);
      setUpdateType(null);
    } catch (err) {
      setError(`Failed to ${updateType} booking. Please try again.`);
    }
  };

  const handleUpdateCancel = () => {
    setShowUpdateModal(false);
    setBookingToUpdate(null);
    setUpdateType(null);
  };

  const handleBack = () => {
    navigate("/profile");
  };

  const calculateStats = () => {
    if (!bookings || bookings.length === 0) {
      return { pending: 0, approved: 0, denied: 0, total: 0 };
    }

    return bookings.reduce(
      (stats, booking) => {
        // Adjust counting logic to match what backend actually sends:(did not know what I should have done otherwise)
        // Confirmed: status=true (regardless of pending value)
        // Pending: either isPending or pending = true (and status is not true)
        // Denied: status=false AND pending=false
        const isPendingStatus =
          booking.isPending === true || booking.pending === true;

        if (booking.status === true) {
          stats.approved++;
        } else if (isPendingStatus) {
          stats.pending++;
        } else {
          stats.denied++;
        }
        stats.total++;
        return stats;
      },
      { pending: 0, approved: 0, denied: 0, total: 0 }
    );
  };

  const bookingStats = calculateStats();

  // Helper function to get booking status display
  const getBookingStatusDisplay = (booking) => {
    // Check which pending property is available
    const isPendingStatus =
      booking.isPending === true || booking.pending === true;

    // Fix logic to match what backend actually sends:
    // Confirmed: status=true (regardless of pending value)
    // Pending: either isPending or pending = true (and status is not true)
    // Denied: status=false AND pending=false AND isPending=false
    if (booking.status === true) {
      return {
        text: "Confirmed",
        className: "status-confirmed",
      };
    } else if (isPendingStatus) {
      return {
        text: "Pending",
        className: "status-pending",
      };
    } else {
      return {
        text: "Denied",
        className: "status-denied",
      };
    }
  };

  if (listingLoading || loading) {
    return (
      <div className="booking-management-container">
        <div className="loading-spinner">Loading booking information...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="booking-management-container">
        <div className="error-container">
          <div className="error-message">{error}</div>
          <button className="button cancel-button" onClick={handleBack}>
            Back to Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-management-container">
      <h2>Manage Bookings</h2>

      {/* Listing details */}
      {listing && (
        <div className="listing-details">
          <h3>{listing.listingTitle || "Unnamed Listing"}</h3>
          <p className="listing-address">
            {listing.location || "No location specified"}
          </p>
          <p className="listing-price">
            ${listing.listingPricePerNight?.toFixed(2) || "0.00"} per night
          </p>
        </div>
      )}

      {/* Success message */}
      {successMessage && (
        <div className="success-message">
          <p>{successMessage}</p>
        </div>
      )}

      {/* Booking stats */}
      <div className="booking-stats">
        <div className="stat-item">
          <span className="stat-label">Total Bookings</span>
          <span className="stat-value">{bookingStats.total}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Pending</span>
          <span className="stat-value stat-pending">
            {bookingStats.pending}
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Confirmed</span>
          <span className="stat-value stat-confirmed">
            {bookingStats.approved}
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Denied</span>
          <span className="stat-value stat-denied">{bookingStats.denied}</span>
        </div>
      </div>

      {/* Bookings list */}
      <div className="bookings-container">
        <h3>Booking Requests</h3>

        {bookings.length === 0 ? (
          <div className="no-bookings">
            <p>No bookings have been made for this listing yet.</p>
          </div>
        ) : (
          <div className="bookings-list">
            {bookings.map((booking) => {
              const statusDisplay = getBookingStatusDisplay(booking);
              // Only display Approve/Deny buttons for pending bookings
              const isPending =
                booking.pending === true || booking.isPending === true;

              return (
                <div key={booking.bookingID} className="booking-card">
                  <div className="booking-header">
                    <h4>Booking #{booking.bookingID.substring(0, 8)}...</h4>
                    <span
                      className={`booking-status ${statusDisplay.className}`}
                    >
                      {statusDisplay.text}
                    </span>
                  </div>

                  <div className="booking-details">
                    <p>
                      <strong>Guest:</strong>{" "}
                      {booking.userId.userName || "Unknown Guest"}
                    </p>
                    <p>
                      <strong>Dates:</strong> {formatDate(booking.startDate)} to{" "}
                      {formatDate(booking.endDate)}
                    </p>
                    <p>
                      <strong>Total Cost:</strong> $
                      {booking.totalCost?.toFixed(2) || "0.00"}
                    </p>
                    {booking.message && (
                      <p>
                        <strong>Message:</strong> {booking.message}
                      </p>
                    )}
                  </div>

                  {isPending && (
                    <div className="booking-actions">
                      <button
                        className="action-button approve-button"
                        onClick={() => handleUpdateClick(booking, "approve")}
                      >
                        Approve
                      </button>
                      <button
                        className="action-button deny-button"
                        onClick={() => handleUpdateClick(booking, "deny")}
                      >
                        Deny
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Back button */}
      <div className="form-buttons">
        <button className="button cancel-button" onClick={handleBack}>
          Back to Profile
        </button>
      </div>

      {/* Update confirmation modal */}
      {showUpdateModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>
              {updateType === "approve" ? "Approve Booking" : "Deny Booking"}
            </h3>
            <p>
              Are you sure you want to{" "}
              {updateType === "approve" ? "approve" : "deny"} this booking?
            </p>
            <div className="modal-actions">
              <button
                className={`button ${
                  updateType === "approve" ? "approve-button" : "deny-button"
                }`}
                onClick={handleUpdateConfirm}
                disabled={isUpdating}
              >
                {isUpdating ? "Processing..." : "Confirm"}
              </button>
              <button
                className="button cancel-button"
                onClick={handleUpdateCancel}
                disabled={isUpdating}
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

export default BookingManagement;
