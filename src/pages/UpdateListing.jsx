import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import api from "../api/axios";
import "./CreateListing.css"; // Reuse the same styling

/**
 * UpdateListing Component
 *
 * Allows users to update an existing listing.
 */
const UpdateListing = () => {
    const navigate = useNavigate();
    const {listingId} = useParams();
    const {userId} = useAuth();
    const [loading, setLoading] = useState(false);
    const[fetchLoading, setFetchLoading] = useState(true);
    const[errorMessage,SetErrorMessage] = useState("");
}
//Form state
const [formData, setFormData] = useState({
    hostId: userId,
    listingTitle: "",
    listingDescription: "",
    listingPricePerNight: "",
    guestLimit: 1,
    listingImages: [],
  });
  
  // Image URLs state for tracking multiple image URLs
  const [imageUrl, setImageUrl] = useState("");
