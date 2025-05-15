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
            [name]: parseInt(value,10) || 1,
        })
    }
  };
};
