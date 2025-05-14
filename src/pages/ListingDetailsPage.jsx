import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import "./ListingDetail.css";

const ListingDetailsPage = () => {
  const { listingId } = useParams();
  const navigate = useNavigate();
  const { currentUser, userId } = useAuth();

  // Core state
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDates, setSelectedDates] = useState([]);
  const [numberOfNights, setNumberOfNights] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState(null);

}
  //Placeholder data
  useEffect(() => {
    // Simulate API call delay
    setTimeout(() => {
      setListing({
        listingId: "placeholder-123",
        listingTitle: "Placeholder Listing Title",
        location: "Stockholm, Sweden",
        listingPricePerNight: 1200,
        description: "This is a placeholder description for this listing.",
      });
      setLoading(false);
    }, 1000);
  }, [listingId]);

  // Calculate number of nights and total price when dates change
  useEffect(() => {
    if (selectedDates.length === 2 && listing) {
      const startDate = new Date(selectedDates[0]);
      const endDate = new Date(selectedDates[1]);
      const diffTime = Math.abs(endDate - startDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      setNumberOfNights(diffDays);
      setTotalPrice(diffDays * listing.listingPricePerNight);
    } else {
      setNumberOfNights(0);
      setTotalPrice(0);
    }
  }, [selectedDates, listing]);

 // Handle booking creation
 const handleBooking = () => {
    // Reset booking status
    setBookingError(null);
    setBookingLoading(true);
    setBookingSuccess(false);

    // Check user authentication
    if (!currentUser || !userId) {
      setBookingError("You must be logged in to make a booking.");
      setBookingLoading(false);
      return;
    }

    if (selectedDates.length !== 2) {
      setBookingError("Please select check-in and check-out dates");
      setBookingLoading(false);
      return;
    }

    // Simulate booking process
    setTimeout(() => {
      setBookingLoading(false);
      setBookingSuccess(true);

      // Show success message
      setTimeout(() => {
        // In real app would navigate to profile
        setBookingSuccess(false);
        setSelectedDates([]);
      }, 2000);
    }, 1500);
  };

  if (loading) {
    return <div className="loading-state">Loading listing details...</div>;
  }

  if (error) {
    return <div className="error-state">{error}</div>;
  }

  if (!listing) {
    return <div className="error-state">Listing not found</div>;
  }

  return (
    <div className="listing-detail-container">
      <section className="listing-header">
        <h1>{listing.listingTitle}</h1>
        <p className="listing-location">{listing.location}</p>
      </section>

      <section className="listing-image">
        <div className="placeholder-image">Listing Image Placeholder</div>
      </section>

      <section className="listing-booking-info">
        <div className="listing-price">
          <p>
            <span className="price">{listing.listingPricePerNight} kr</span>
            <span className="per-night"> / night</span>
          </p>
        </div>
      </section>

      <hr />

      <section className="listing-description">
        <h2>About this place</h2>
        <p>{listing.description || "Placeholder description text."}</p>
      </section>

      <hr />

      <section className="booking-section">
        <h2>Select dates</h2>
        <DatePicker
          selectedDates={selectedDates}
          onDateChange={setSelectedDates}
          bookedDates={[]} // Would be populated from API
          availableDates={[]} // Would be populated from API
        />

        {selectedDates.length === 2 && (
          <div className="booking-summary">
            <h3>Booking Summary</h3>
            <div className="booking-line">
              <span>
                {listing.listingPricePerNight} kr × {numberOfNights} nights
              </span>
              <span>{totalPrice} kr</span>
            </div>
            <div className="booking-line total">
              <span>Total</span>
              <span>{totalPrice} kr</span>
            </div>
          </div>
        )}

        {bookingError && <div className="booking-error">{bookingError}</div>}

        {bookingSuccess && (
          <div className="booking-success">
            Booking successful! You'll be redirected shortly.
          </div>
        )}

        <button
          className="reserve-button"
          onClick={handleBooking}
          disabled={bookingLoading || selectedDates.length !== 2}
        >
          {bookingLoading ? "Processing..." : "Reserve"}
        </button>
      </section>
    </div>
  );
export default ListingDetail;
  