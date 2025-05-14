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

  const [formData, setFormData] = useState({
    hostId: userId,
    listingTitle: "",
    listingDescription: "",
    listingPricePerNight: "",
    guestLimit: 1,
    listingImages: [],
  });






  
};
