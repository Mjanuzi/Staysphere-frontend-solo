import { useState } from "react";
import "./Header.css";

/**
 * Header Component
 *
 * Contains the search bar and filter options for the application.
 * Implements responsive design for different screen sizes.
 */
const Header = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("hotel");

  // Filter categories for the scrollable filter section with SVG icons
  const filters = [
    {
      id: "hotel",
      label: "Hotel",
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M3 21H21M3 18H21M6 10H10V18H6V10ZM14 10H18V18H14V10ZM5 6L12 3L19 6M4 8H20V10H4V8Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      id: "private",
      label: "Private",
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M3 21H21M6 18V9.99998M18 18V9.99998M3 11L12 4L21 11"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      id: "popular",
      label: "Popular",
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      id: "cabin",
      label: "Cabin",
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M3 21H21M5 9L12 3L19 9M5 21V9M19 21V9M9 14V10M15 14V10M9 21V17H15V21"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      id: "beach",
      label: "Beach",
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M7.49999 16C9.21685 14.2833 13.7831 9.7169 18.5 15C18.5 15 15.5 15 13.5 16.5M7.49999 16L3.99999 12.5M7.49999 16L5.99999 18C5.99999 18 14.5 18 15.5 21M6.99999 3.99998C6.99999 3.99998 -1.00001 12 3.99999 12.5M11 8.99998C11 8.99998 13 10 14 12M14 5.99998C14 7.1045 13.1045 7.99998 12 7.99998C10.8955 7.99998 9.99999 7.1045 9.99999 5.99998C9.99999 4.89542 10.8955 3.99998 12 3.99998C13.1045 3.99998 14 4.89542 14 5.99998Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
  ];

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // Search functionality will be implemented later
    console.log("Search submitted:", searchQuery);
  };

  const handleFilterClick = (filterId) => {
    setActiveFilter(filterId);
  };

  return (
    <>
      <div className="status-bar">
        <div className="status-time">9:41</div>
        <div className="status-icons">
          <span>●●●</span>
          <span>📶</span>
          <span>🔋</span>
        </div>
      </div>

      <div className="header-container">
        <div className="search-container">
          <form onSubmit={handleSearchSubmit}>
            <div className="search-input-wrapper">
              <svg
                className="search-icon"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                width="18"
                height="18"
              >
                <path d="M10.5 3.75a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5zm-8.25 6.75a8.25 8.25 0 1 1 14.59 5.28l4.69 4.69a.75.75 0 1 1-1.06 1.06l-4.69-4.69A8.25 8.25 0 0 1 2.25 10.5z" />
              </svg>
              <input
                type="text"
                className="search-input"
                placeholder="Search Destination"
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
          </form>
        </div>

        <div className="filters-container">
          <div className="filters-scroll">
            {filters.map((filter) => (
              <button
                key={filter.id}
                className={`filter-button ${
                  activeFilter === filter.id ? "active" : ""
                }`}
                onClick={() => handleFilterClick(filter.id)}
              >
                <span className="filter-icon">{filter.icon}</span>
                <span className="filter-label">{filter.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;