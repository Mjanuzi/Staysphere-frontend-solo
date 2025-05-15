import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

/* Create listing page
 *that lets user create a listing for their property */

const CreateListing = () => {
  const navigate = useNavigate();
  const { userId } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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

      //Send the data to the server
      const response = await api.post("/api/listing/create", submissionData);

      // navigate to profile page if successful
      navigate("/profile");
    } catch (error) {
      console.error("Error creating listing:", error);
      setErrorMessage(
        error.response?.data?.message ||
          "Failed to create listing. Please try again."
      );
    } finally {
      setLoading(false);
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
      </form>
    </div>
  );
};
