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
  // Fetch listing data when component mounts
  useEffect(() => {
    const fetchListing = async () => {
      try {
        setFetchLoading(true);
        const response = await api.get(`/api/listing/getbyid/${listingId}`);
        const listingData = response.data;

        // Set form data from listing
        setFormData({
          hostId: listingData.hostId,
          listingTitle: listingData.listingTitle,
          listingDescription: listingData.listingDescription,
          listingPricePerNight: listingData.listingPricePerNight,
          guestLimit: listingData.guestLimit,
          listingImages: listingData.listingImages || [],
        });
      } catch (error) {
        console.error("Error fetching listing:", error);
        setErrorMessage(
          error.response?.data?.message ||
            "Failed to fetch listing details. Please try again."
        );
      } finally {
        setFetchLoading(false);
      }
    };

    if (listingId) {
      fetchListing();
    }
  }, [listingId]);


   // Handle input changes
   const handleChange = (e) => {
    const { name, value } = e.target;

    // Convert price to number
    if (name === "listingPricePerNight") {
      setFormData({
        ...formData,
        [name]: parseFloat(value) || "",
      });
    }
    // Convert guest limit to integer
    else if (name === "guestLimit") {
      setFormData({
        ...formData,
        [name]: parseInt(value, 10) || 1,
      });
    }
    // Regular string fields
    else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  // Add image URL to the array
  const handleAddImage = () => {
    if (imageUrl.trim() !== "") {
      setFormData({
        ...formData,
        listingImages: [...formData.listingImages, imageUrl],
      });
      setImageUrl("");
    }
  };
  // Remove image URL from the array
  const handleRemoveImage = (index) => {
    const updatedImages = [...formData.listingImages];
    updatedImages.splice(index, 1);
    setFormData({
      ...formData,
      listingImages: updatedImages,
    });
  };
    // Submit form
    const handleSubmit = async (e) => {
        e.preventDefault();
    
        // Validate form
        if (!formData.listingTitle.trim()) {
          setErrorMessage("Listing title is required");
          return;
        }
    
        if (!formData.listingDescription.trim()) {
          setErrorMessage("Listing description is required");
          return;
        }
    
        if (!formData.listingPricePerNight || formData.listingPricePerNight <= 0) {
          setErrorMessage("Valid price per night is required");
          return;
        }
    
        if (!formData.guestLimit || formData.guestLimit < 1) {
          setErrorMessage("Guest limit must be at least 1");
          return;
        }
    
        try {
          setLoading(true);
          setErrorMessage("");
    
          // Make sure hostId is set to the current userId
          const submissionData = {
            ...formData,
            hostId: userId,
          };
    
          // Send the data to the server
          await api.patch(`/api/listing/patch/${listingId}`, submissionData);
    
          // If successful, navigate to profile page
          navigate("/profile");
        } catch (error) {
          console.error("Error updating listing:", error);
          setErrorMessage(
            error.response?.data?.message ||
              "Failed to update listing. Please try again."
          );
        } finally {
          setLoading(false);
        }
      };
