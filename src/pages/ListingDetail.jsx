import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import axios from "axios";
import DatePicker from "../components/DatePicker";
import { format, addDays, subDays } from "date-fns";

import "./ListingDetail.css";

/**
 * Helper function to normalize date format to YYYY-MM-DD string
 * Works with various input formats and ensures consistent output
 */
const normalizeDateString = (dateInput) => {
  if (!dateInput) return null;

  try {
    // If already in YYYY-MM-DD format, return as is
    if (
      typeof dateInput === "string" &&
      /^\d{4}-\d{2}-\d{2}$/.test(dateInput)
    ) {
      return dateInput;
    }

    // Handle Date objects or string dates
    let date;
    if (dateInput instanceof Date) {
      date = dateInput;
    } else if (typeof dateInput === "string") {
      // Extract date part if ISO format
      if (dateInput.includes("T")) {
        dateInput = dateInput.split("T")[0];
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
          return dateInput;
        }
      }
      // Create date object
      date = new Date(dateInput);
    } else {
      return null;
    }

    // Check if date is valid
    if (isNaN(date.getTime())) return null;

    // Format as YYYY-MM-DD
    return format(date, "yyyy-MM-dd");
  } catch (e) {
    console.error("Error normalizing date:", e);
    return null;
  }
};

/**
 * Check if dates need timezone correction
 * This detects the issue where dates from MongoDB are shifted due to timezone differences
 */
const needsTimezoneCorrection = () => {
  // Check if the local timezone is not UTC
  const timezoneOffset = new Date().getTimezoneOffset();

  // If timezone offset is not 0 (not UTC) and we have a negative offset
  // (e.g., Europe/Stockholm is UTC+2, so offset is -120 minutes)
  return timezoneOffset < 0;
};

/**
 * Apply timezone correction to the dates
 * This fixes the issue where dates are incorrectly shifted
 */
const applyTimezoneCorrection = (dateStrings) => {
  if (!dateStrings || !Array.isArray(dateStrings) || dateStrings.length === 0)
    return [];

  return dateStrings.map((dateStr) => {
    try {
      // Parse date string to create a date at noon UTC
      const date = new Date(`${dateStr}T12:00:00Z`);

      // Correct the date - for positive timezone offset (like UTC+2),
      // we need to subtract a day to get the correct date
      const correctedDate = subDays(date, 1);

      // Format back to YYYY-MM-DD
      return format(correctedDate, "yyyy-MM-dd");
    } catch (e) {
      return dateStr; // If there's an error, keep the original string
    }
  });
};

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
<<<<<<< HEAD
  const [availableDateStrings, setAvailableDateStrings] = useState([]);
=======
>>>>>>> 6d445200a9137c6fa0f10dfbea0933b66f9ad731

  // Fetch listing data and availability
  useEffect(() => {
    const fetchListingData = async () => {
      setLoading(true);
      try {
        // Call the API endpoint
        const response = await axios.get(`/api/listing/getbyid/${listingId}`);
<<<<<<< HEAD
        setListing(response.data);

        // Process available dates
        if (response.data.available && Array.isArray(response.data.available)) {
          const rawDates = response.data.available;

          // Normalize dates to consistent YYYY-MM-DD format
          const normalizedDates = new Set();
          rawDates.forEach((date) => {
            const normalized = normalizeDateString(date);
            if (normalized) normalizedDates.add(normalized);
          });

          // Convert to arrays for component props
          let dateStrings = Array.from(normalizedDates);

          // Apply timezone correction if needed
          const needsCorrection = needsTimezoneCorrection();
          if (needsCorrection) {
            dateStrings = applyTimezoneCorrection(dateStrings);
          }

          // Create Date objects (noon UTC to avoid timezone issues)
          const dateObjects = dateStrings.map(
            (dateStr) => new Date(`${dateStr}T12:00:00Z`)
          );

          // Update state
          setAvailableDateStrings(dateStrings);
          setAvailableDates(dateObjects);
        } else {
          setAvailableDateStrings([]);
          setAvailableDates([]);
        }

        // Process booked dates with the same approach
=======

        // Set the listing data
        setListing(response.data);

        // Convert available date strings to Date objects
        if (response.data.available && Array.isArray(response.data.available)) {
          const convertedDates = response.data.available
          .map((dateStr) => {
            // Parse as UTC by appending 'Z' to the date string
            return new Date(dateStr + 'T00:00:00Z'); 
          })
          .filter((date) => !isNaN(date.getTime())); // Filter out invalid dates

          setAvailableDates(convertedDates);
        } else {
          console.log("No availability data found in response");
          setAvailableDates([]);
        }

        // Extract booked dates if available (same conversion logic)
>>>>>>> 6d445200a9137c6fa0f10dfbea0933b66f9ad731
        if (
          response.data.bookedDates &&
          Array.isArray(response.data.bookedDates)
        ) {
<<<<<<< HEAD
          const bookedStrings = new Set();
          response.data.bookedDates.forEach((date) => {
            const normalized = normalizeDateString(date);
            if (normalized) bookedStrings.add(normalized);
          });

          let bookedDateStrings = Array.from(bookedStrings);

          // Apply timezone correction if needed
          const needsCorrection = needsTimezoneCorrection();
          if (needsCorrection) {
            bookedDateStrings = applyTimezoneCorrection(bookedDateStrings);
          }

          const bookedObjects = bookedDateStrings.map(
            (dateStr) => new Date(`${dateStr}T12:00:00Z`)
          );

          setBookedDates(bookedObjects);
=======
          const convertedBookedDates = response.data.bookedDates
            .map((dateStr) => {
              // Parse as UTC by appending 'Z' here too
              return new Date(dateStr + 'T00:00:00Z'); 
            })
            .filter((date) => !isNaN(date.getTime()));
        
          setBookedDates(convertedBookedDates);
>>>>>>> 6d445200a9137c6fa0f10dfbea0933b66f9ad731
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching listing:", err);
        setError("Failed to load listing details. Please try again later.");
        setLoading(false);
<<<<<<< HEAD
=======

        // Fallback for development (no longer needed with working API)
>>>>>>> 6d445200a9137c6fa0f10dfbea0933b66f9ad731
      }
    };

    fetchListingData();
  }, [listingId]);

  // Handle night count changes from the DatePicker
<<<<<<< HEAD
  const handleNightCountChange = useCallback(
    (nights) => {
      setNumberOfNights(nights);
      if (listing && nights > 0) {
        setTotalPrice(nights * listing.listingPricePerNight);
      } else {
        setTotalPrice(0);
      }
    },
    [listing]
  );

  // Check if a date is available using string comparison
  const isDateAvailable = useCallback(
    (date) => {
      if (!date) return false;
      // Format the date consistently
      const dateString = format(date, "yyyy-MM-dd");
      // Compare against our normalized available dates
      return availableDateStrings.includes(dateString);
    },
    [availableDateStrings]
  );
=======
  const handleNightCountChange = (nights) => {
    setNumberOfNights(nights);
    if (listing && nights > 0) {
      setTotalPrice(nights * listing.listingPricePerNight);
    } else {
      setTotalPrice(0);
    }
  };
>>>>>>> 6d445200a9137c6fa0f10dfbea0933b66f9ad731

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
<<<<<<< HEAD
          availableDateStrings={availableDateStrings}
          isDateAvailable={isDateAvailable}
=======
          debug={false}
>>>>>>> 6d445200a9137c6fa0f10dfbea0933b66f9ad731
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
