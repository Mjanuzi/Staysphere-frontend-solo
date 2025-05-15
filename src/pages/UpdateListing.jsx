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
}