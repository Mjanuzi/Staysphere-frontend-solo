import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useListingsApi } from "../hooks/useListingsApi";
import "./CreateListing.css";

/* Create listing page
 *that lets user create a listing for their property */

const CreateListing = () => {
  const navigate = useNavigate();
  const { userId } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { createListing, isCreating } = useListingsApi();

  //set up initial listing form data with host ID from current user
  const [formData, setFormData] = useState({
    hostId: userId,
    listingTitle: "",
    listingDescription: "",
    listingPricePerNight: "",
    guestLimit: 1,
    listingImages: [],
  });

  // Image URLs state for tracking multiple image URLs
  const [imageUrls, setImageUrl] = useState([]);

  //handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    // convert price to number
    if (name === "listingPricePerNight") {
      setFormData({
        ...formData,
        [name]: parseFloat(value) || "",
      });
    }

    //convert guests to integer
    else if (name === "guestLimit") {
      setFormData({
        ...formData,
        [name]: parseInt(value, 10) || 1,
      });
    }

    //regular string values
    else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  //add image to the array

  const handleAdllImg = () => {
    if (imageUrls.trim() !== "") {
      setFormData({
        ...formData,
        listingImages: [...formData.listingImages, imageUrls],
      });
      setImageUrl("");
    }
  };

  //remove img fron the array
  const handleRemoveImg = (index) => {
    const updatedImgs = [...formData.listingImages];
    updatedImgs.splice(index, 1);
    setFormData({
      ...formData,
      listingImages: updatedImgs,
    });
  };

  //submit form

  const handleSubmit = async (e) => {
    e.preventDefault();

    //validate form
    if (!formData.listingTitle.trim()) {
      setErrorMessage("Listing title is required");
      return;
    }
    if (!formData.listingDescription.trim()) {
      setErrorMessage("Description is required");
      return;
    }
    if (!formData.listingPricePerNight || formData.listingPricePerNight <= 0) {
      setErrorMessage("Valid price per night is required");
      return;
    }
    if (!formData.guestLimit || formData.guestLimit <= 0) {
      setErrorMessage("Guest limit must be at least 1");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");

      //checking if hostid is set to the current user
      const submissionData = {
        ...formData,
        hostId: userId,
      };

      console.log("Creating listing with data: ", submissionData);

      //Send the data to the server
      //const response = await api.post("/api/listing/create", submissionData);
      createListing(submissionData, {
        onSuccess: () => {
          console.log("Listing created successfully");
          navigate("/profile");
        },
        onError: (error) => {
          console.error("Error in mutation:", error);
          setErrorMessage(
            error.message || "Failed to create listing. Please try again."
          );
        },
      });
    } catch (error) {
      console.error("Error creating listing:", error);
      setErrorMessage("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div className="create-listing-container">
      <h1>Create New Listing</h1>

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
            placeholder="Enter a title for your listing"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="listingPricePerNight">Price Per Night (SEK) *</label>
          <input
            type="number"
            id="listingPricePerNight"
            name="listingPricePerNight"
            value={formData.listingPricePerNight}
            onChange={handleChange}
            placeholder="Enter a price per night"
            min="1"
            step="0.01"
            required
          />
        </div>

        <div className="form-group">
            <label htmlFor="guestLimit">Guest Limit *</label>
            <input type="number"
            id="guestLimit"
            name="guestLimit"
            value={formData.guestLimit}
            onChange={handleChange}
            placeholder="Enter maximum numbers of guests"
            min="1"
            required />
        </div>



        <div className="form-group">
          <label htmlFor="listingDescription">Listing Description *</label>
          <textarea
            id="listingDescription"
            name="listingDescription"
            value={formData.listingDescription}
            onChange={handleChange}
            placeholder="Describe your property, amenities, and surrounding area"
            required
          />
        </div>

        <div className="form-group">
          <label>Images</label>
          <div className="image-input-container">
            <input
              type="text"
              value={imageUrls}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Enter image URLs"
            />

            <button
              type="button"
              onClick={handleAdllImg}
              className="add-image-button"
            >
              Add image
            </button>
          </div>

          {formData.listingImages.length > 0 && (
            <div className="image-preview-container">
              <h3>Image URLs</h3>
              <ul className="image-list">
                {formData.listingImages.map((url, index) => (
                  <li key={index} className="image-item">
                    <span className="image-url">{url}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveImg(index)}
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
            disabled={isCreating}
          >
            Cancel
          </button>
          <button type="submit" className="submit-button" disabled={isCreating}>
            {isCreating ? "Creating..." : "Create Listing"}
          </button>
        </div>
      </form>
    </div>
  );
};
export default CreateListing;
