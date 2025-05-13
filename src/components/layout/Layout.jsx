import { useState, useEffect } from "react";
import Header from "./Header";
import Footer from "./Footer";
import "./Layout.css";

/**
 * Layout Component
 *
 * Serves as the main container for the application layout.
 * Contains the header, main content area, and footer.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - The content to be rendered in the main area
 */
const Layout = ({ children }) => {
  const [scrolled, setScrolled] = useState(false);

  // Add scroll listener to detect when user scrolls for potential header modifications
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [scrolled]);

  return (
    <div className="layout">
      <header className={`layout-header ${scrolled ? "scrolled" : ""}`}>
        <Header />
      </header>
      <main className="layout-main">{children}</main>
      <footer className="layout-footer">
        <Footer />
      </footer>
    </div>
  );
};

export default Layout;