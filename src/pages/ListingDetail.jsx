import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useListingsApi } from "../hooks/useListingsApi";
import { useBookingsApi } from "../hooks/useBookingsApi";
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

  // Use React Query hooks with proper options
  const {
    useListingById,
    loading: listingLoading,
    error: listingError,
  } = useListingsApi({ enabled: true });

  const {
    createBooking,
    isCreating: bookingLoading,
    error: bookingError,
  } = useBookingsApi({ enabled: true });

  // Get listing data using React Query
  const { data: listing } = useListingById(listingId);

  // Core state
  const [selectedDates, setSelectedDates] = useState([]);
  const [numberOfNights, setNumberOfNights] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [availableDates, setAvailableDates] = useState([]);
  const [bookedDates, setBookedDates] = useState([]);
  const [availableDateStrings, setAvailableDateStrings] = useState([]);

  // Process listing data when it changes
  useEffect(() => {
    if (!listing) return;

    // Process available dates
    if (listing.available && Array.isArray(listing.available)) {
      const rawDates = listing.available;
      const normalizedDates = new Set();

      rawDates.forEach((date) => {
        const normalized = normalizeDateString(date);
        if (normalized) normalizedDates.add(normalized);
      });

      let dateStrings = Array.from(normalizedDates);

      if (needsTimezoneCorrection()) {
        dateStrings = applyTimezoneCorrection(dateStrings);
      }

      const dateObjects = dateStrings.map(
        (dateStr) => new Date(`${dateStr}T12:00:00Z`)
      );

      setAvailableDateStrings(dateStrings);
      setAvailableDates(dateObjects);
    } else {
      setAvailableDateStrings([]);
      setAvailableDates([]);
    }

    // Process booked dates
    if (listing.bookedDates && Array.isArray(listing.bookedDates)) {
      const bookedStrings = new Set();
      listing.bookedDates.forEach((date) => {
        const normalized = normalizeDateString(date);
        if (normalized) bookedStrings.add(normalized);
      });

      let bookedDateStrings = Array.from(bookedStrings);

      if (needsTimezoneCorrection()) {
        bookedDateStrings = applyTimezoneCorrection(bookedDateStrings);
      }

      const bookedObjects = bookedDateStrings.map(
        (dateStr) => new Date(`${dateStr}T12:00:00Z`)
      );

      setBookedDates(bookedObjects);
    }
  }, [listing]);

  // Handle night count changes from the DatePicker
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
      const dateString = format(date, "yyyy-MM-dd");
      return availableDateStrings.includes(dateString);
    },
    [availableDateStrings]
  );

  // Handle booking creation
  const handleBooking = async () => {
    if (!currentUser || !userId) {
      return;
    }

    if (selectedDates.length !== 2 || !selectedDates[0] || !selectedDates[1]) {
      return;
    }

    if (numberOfNights <= 0) {
      return;
    }

    try {
      const bookingData = {
        listingId,
        checkIn: format(selectedDates[0], "yyyy-MM-dd"),
        checkOut: format(selectedDates[1], "yyyy-MM-dd"),
        numberOfNights,
        totalPrice,
        userId: currentUser.username, // Add user information
      };

      await createBooking(bookingData);
      setBookingSuccess(true);

      // Reset form after successful booking
      setTimeout(() => {
        setBookingSuccess(false);
        setSelectedDates([]);
        navigate("/profile"); // Navigate to profile page after booking
      }, 2000);
    } catch (err) {
      console.error("Booking error:", err);
    }
  };

  if (listingLoading) {
    return <div className="loading-state">Loading listing details...</div>;
  }

  if (listingError) {
    return (
      <div className="error-state">
        {listingError.message || "Failed to load listing"}
      </div>
    );
  }

  if (!listing) {
    return <div className="error-state">Listing not found</div>;
  }

  //get images from listings
  const getListingImage = () => {
    if (listing.listingImages && listing.listingImages.length > 0) {
      return listing.listingImages[0];
    }

    // Default image if none provided
    return "https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcRT7i7bQB0Z_F2zXCI2H-wbpP-bsUkYSgjw08dbluvC8kR71kuENJmumDLU4BpHXwLreCkRcpKA6VSZxkH07Zp5y1EA_vyZ8HJPUHxzyu-jciS1Ah9lQw5T";
  };

  return (
    <div className="listing-detail-container">
      <section className="listing-header">
        <h1>{listing.listingTitle}</h1>
        <p className="listing-location">{listing.location}</p>
      </section>

      <section className="listing-image">
        <img
          src={getListingImage(listing)}
          alt={listing.listingTitle || "Listing"}
          className="listing-detail-image"
        />
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
          availableDateStrings={availableDateStrings}
          isDateAvailable={isDateAvailable}
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

        {bookingError && (
          <div className="booking-error">
            {bookingError.message || "Failed to create booking"}
          </div>
        )}

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
