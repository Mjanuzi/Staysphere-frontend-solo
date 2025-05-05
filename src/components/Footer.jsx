import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import "../components/components.css/Footer.css";

/**Footer component to the bottom of the screen for mobile
 *
 * Change options from Login to My profile when logged on based on authentication status.
 */

const Footer = () => {
  const location = useLocation();
  const { currentUser } = useAuth();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="footer-nav">

        /**Link to home page */
      <Link to="/" className={`nav-item ${isActive("/") ? "active" : ""}`}>
        <div className="nav-icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            width="24"
            height="24"
          >
            <path d="M12 2.25L2.25 10.5H4.5v9.75h15v-9.75h2.25L12 2.25zm4.5 16.5h-9v-6H9v3h6v-3h1.5v6z" />
          </svg>
        </div>
        <span className="nav-label">Home</span>
      </Link>

      /**Link to listings */




      /**Link to profile page */

      /**Link to login */
    </nav>
  );
};
export default Footer;
