import { useEffect } from "react";
import Header from "./Header";
import Footer from "./Footer";
import "./Layout.css";

/**
 * Layout Component
 *
 * Provides a consistent layout structure for all pages with header and footer.
 * The children prop represents the page content that will be rendered inside the layout.
 */
const Layout = ({ children }) => {
  // Scroll to top when navigating between pages
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [children]);

  return (
    <div className="layout">
      <Header />
      <main className="main-content">{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;