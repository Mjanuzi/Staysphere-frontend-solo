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
