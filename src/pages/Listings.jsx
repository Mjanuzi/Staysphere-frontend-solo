import React from "react";
import { useNavigate } from "react-router-dom";
import { useListings } from "../hooks/useListings";

/**Listing page
 * Display all listings, fetching data from backend
 */

const Listings = () => {
    const navigate = useNavigate();
    //Using the listings hook
    const {Listings, loading, error, fetchListings} = useListings(true);
}

