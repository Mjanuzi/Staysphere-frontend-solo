import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import "./Footer.css";

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
      {/**Link to home page */}
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
      {/**Link to listings */}
      <Link
        to="/listings"
        className={`nav-item ${isActive("/listings") ? "active" : ""}`}
      >
        <div className="nav-icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            width="24"
            height="24"
          >
            <path d="M10.5 3.75a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5zm0 18a11.25 11.25 0 1 1 0-22.5 11.25 11.25 0 0 1 0 22.5zm-1.5-3.75h3v-7.5h-3v7.5z" />
          </svg>
        </div>
        <span className="nav-label">Listings</span>
      </Link>
      {/**Link to profile page/login page when or when not logged on */}
      {currentUser ? (
        <Link to="/profile" className={`nav-item ${isActive("/profile") ? "active" : ""}`}>
            <div className="nav-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
            <path d="M12 2.25A4.5 4.5 0 0 0 7.5 6.75v1.5a4.5 4.5 0 0 0 9 0v-1.5A4.5 4.5 0 0 0 12 2.25zm-1.5 12h3a6 6 0 0 1 6 6v.75h-15v-.75a6 6 0 0 1 6-6z" />
            </svg>
            </div>
            <span className="nav-label">Profile</span>
        </Link>
      ) : (
        <Link to="/login" className={`nav-item ${isActive("/login") ? "active" : ""}`}>
            <div className="nav-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
            <path d="M12 3.75a6 6 0 0 0-6 6v2.25h4.5v-2.25a1.5 1.5 0 0 1 3 0v2.25h4.5v-2.25a6 6 0 0 0-6-6zm-7.5 12v4.5h15v-4.5h-15z" />
            </svg>
            </div>
            <span className="nav-label">Login</span>
        </Link>
    )}
    </nav>
  );
};
export default Footer;
