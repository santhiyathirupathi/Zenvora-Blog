import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, PenSquare } from "lucide-react";
import "./HeaderFooter.css";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="site-header">
      <div className="site-header-inner">
        {/* Logo - Pure Text Brand (No Icon) */}
        <Link to="/" className="site-logo">
          <span className="logo-title">ZENVORA</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="site-nav">
          <Link
            to="/"
            className={`nav-link ${isActive("/") && location.pathname === "/" ? "active" : ""}`}
          >
            Home
          </Link>
          <Link
            to="/blogs"
            className={`nav-link ${isActive("/blogs") ? "active" : ""}`}
          >
            Articles
          </Link>
          <a href="/#categories" className="nav-link">
            Categories
          </a>
        </nav>

        {/* Right CTA */}
        <div className="header-right">
          <Link to="/admin" className="write-cta-btn">
            <PenSquare size={15} />
            <span>Editorial Admin</span>
          </Link>

          <button
            type="button"
            className="mobile-toggle-btn"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="mobile-drawer">
          <nav className="mobile-nav-links">
            <Link to="/" onClick={() => setMobileOpen(false)}>
              Home
            </Link>
            <Link to="/blogs" onClick={() => setMobileOpen(false)}>
              Articles
            </Link>
            <a href="/#categories" onClick={() => setMobileOpen(false)}>
              Categories
            </a>
            <Link
              to="/admin"
              className="mobile-write-link"
              onClick={() => setMobileOpen(false)}
            >
              <PenSquare size={16} /> Editorial Admin
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
