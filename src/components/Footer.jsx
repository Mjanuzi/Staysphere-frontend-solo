import {Link, useLocation} from "react-router-dom";
import {useAuth} from "../hooks/useAuth";

/**Footer component to the bottom of the screen for mobile
 * 
 * Change options from Login to My profile when logged on based on authentication status.
 */

const Footer = () => {
    const location = useLocation();
    const {currentUser} = useAuth();
}

