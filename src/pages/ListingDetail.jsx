import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import axios from "axios";
import DatePicker from "../components/DatePicker";

import "./ListingDetail.css";

const ListingDetail = () => {
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
  const [availableDates, setAvailableDates] = useState([]);
  const [bookedDates, setBookedDates] = useState([]);

  // Fetch listing data and availability
  useEffect(() => {
    const fetchListingData = async () => {
      setLoading(true);
      try {
        // Call the API endpoint
        const response = await axios.get(`/api/listing/getbyid/${listingId}`);

        // Set the listing data
        setListing(response.data);

        // Convert available date strings to Date objects
        if (response.data.available && Array.isArray(response.data.available)) {
          const convertedDates = response.data.available
            .map((dateStr) => {
              // Create a new Date object from the date string
              const date = new Date(dateStr);
              return date;
            })
            .filter((date) => !isNaN(date.getTime())); // Filter out invalid dates

          setAvailableDates(convertedDates);
        } else {
          console.log("No availability data found in response");
          setAvailableDates([]);
        }

        // Extract booked dates if available (same conversion logic)
        if (
          response.data.bookedDates &&
          Array.isArray(response.data.bookedDates)
        ) {
          const convertedBookedDates = response.data.bookedDates
            .map((dateStr) => {
              return new Date(dateStr);
            })
            .filter((date) => !isNaN(date.getTime()));

          setBookedDates(convertedBookedDates);
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching listing:", err);
        setError("Failed to load listing details. Please try again later.");
        setLoading(false);

        // Fallback for development (no longer needed with working API)
      }
    };

    fetchListingData();
  }, [listingId]);

  // Handle night count changes from the DatePicker
  const handleNightCountChange = (nights) => {
    setNumberOfNights(nights);
    if (listing && nights > 0) {
      setTotalPrice(nights * listing.listingPricePerNight);
    } else {
      setTotalPrice(0);
    }
  };

  // Handle booking creation
  const handleBooking = async () => {
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

    if (selectedDates.length !== 2 || !selectedDates[0] || !selectedDates[1]) {
      setBookingError("Please select check-in and check-out dates");
      setBookingLoading(false);
      return;
    }

    if (numberOfNights <= 0) {
      setBookingError(
        "Invalid date selection. Please select a valid date range."
      );
      setBookingLoading(false);
      return;
    }

    // In a real implementation, submit booking to the API
    try {
      // Simulate booking process for now
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
    } catch (err) {
      console.error("Booking error:", err);
      setBookingError("Failed to create booking. Please try again.");
      setBookingLoading(false);
    }
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
          bookedDates={bookedDates}
          availableDates={availableDates}
          onNightCountChange={handleNightCountChange}
          debug={false}
        />

        {numberOfNights > 0 && (
          <div className="booking-summary">
            <h3>Booking Summary</h3>
            <div className="booking-line">
              <span>
                {listing.listingPricePerNight} kr × {numberOfNights}{" "}
                {numberOfNights === 1 ? "night" : "nights"}
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
          disabled={bookingLoading || numberOfNights <= 0}
        >
          {bookingLoading ? "Processing..." : "Reserve"}
        </button>
      </section>
    </div>
  );
};

export default ListingDetail;
