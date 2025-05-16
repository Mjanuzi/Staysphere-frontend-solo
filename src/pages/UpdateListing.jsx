import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import api from "../api/axios";
import "./CreateListing.css"; // Reuse the same styling
import { useListingsApi } from "../hooks/useListingsApi";
/**
 * UpdateListing Component
 *
 * Allows users to update an existing listing.
 */
const UpdateListing = () => {
  const navigate = useNavigate();
  const { listingId } = useParams();
  const { userId } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const {updateListing, isUpdating} =useListingsApi();
  
  

  // Form state
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

      console.log("Updating listing with data: ", submissionData);

      // Send the data to the server
      //await api.patch(`/api/listing/patch/${listingId}`, submissionData);
      updateListing(
        { listingId, listingData: submissionData },
        {
          onSuccess: () => {
            console.log("Listing updated successfully");
            navigate("/profile");
          },
          onError: (error) => {
            console.error("Error in mutation:", error);
            setErrorMessage(
              error.message || "Failed to update listing. Please try again."
            );
          },
        }
      );
    } catch (error) {
      console.error("Error Update listing:", error);
      setErrorMessage("An unexpected error occurred. Please try again.");
    }
  };

  if (fetchLoading) {
    return <div className="loading-state">Loading listing details...</div>;
  }

  return (
    <div className="create-listing-container">
      <h1>Update Listing</h1>

      {errorMessage && <div className="error-message">{errorMessage}</div>}

      <form onSubmit={handleSubmit} className="create-listing-form">
        <div className="form-group">
          <label htmlFor="listingTitle">Listing Title *</label>
          <input
            type="text"
            id="listingTitle"
            name="listingTitle"
            value={formData.listingTitle}
            onChange={handleChange}
            placeholder="Enter a catchy title for your listing"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="listingPricePerNight">Price Per Night (USD) *</label>
          <input
            type="number"
            id="listingPricePerNight"
            name="listingPricePerNight"
            value={formData.listingPricePerNight}
            onChange={handleChange}
            placeholder="Enter price per night"
            min="1"
            step="0.01"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="guestLimit">Guest Limit *</label>
          <input
            type="number"
            id="guestLimit"
            name="guestLimit"
            value={formData.guestLimit}
            onChange={handleChange}
            placeholder="Enter maximum number of guests"
            min="1"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="listingDescription">Description *</label>
          <textarea
            id="listingDescription"
            name="listingDescription"
            value={formData.listingDescription}
            onChange={handleChange}
            placeholder="Describe your property, amenities, and surrounding area"
            rows="5"
            required
          />
        </div>

        <div className="form-group">
          <label>Images</label>
          <div className="image-input-container">
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Enter image URL"
            />
            <button
              type="button"
              onClick={handleAddImage}
              className="add-image-button"
            >
              Add Image
            </button>
          </div>

          {formData.listingImages.length > 0 && (
            <div className="image-preview-container">
              <h3>Image URLs:</h3>
              <ul className="image-list">
                {formData.listingImages.map((url, index) => (
                  <li key={index} className="image-item">
                    <span className="image-url">{url}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="remove-image-button"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate("/profile")}
            className="cancel-button"
            disabled={isUpdating}
            //commit
          >
            Cancel
          </button>
          <button type="submit" className="submit-button" disabled={isUpdating}>
            {isUpdating ? "Updating..." : "Update Listing"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateListing;
