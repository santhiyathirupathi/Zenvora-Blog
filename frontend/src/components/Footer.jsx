import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { SERVER_URL } from "../config";
import "./HeaderFooter.css";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="footer-top-grid">
          {/* Company Details */}
          <div className="footer-brand-col">
            <Link to="/" className="site-logo footer-logo">
              <span className="logo-title">ZENVORA</span>
            </Link>
            <p className="footer-about-text">
              ZENVORA publishes research, software architecture best practices, engineering tutorials,
              and emerging industry trends inspired by modern enterprise standards.
            </p>
            <div className="footer-social-cluster">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="social-icon-btn"
                aria-label="GitHub"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                  <path d="M9 18c-4.51 2-5-2-7-2" />
                </svg>
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="social-icon-btn"
                aria-label="LinkedIn"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect width="4" height="12" x="2" y="9" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="social-icon-btn"
                aria-label="Twitter / X"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="social-icon-btn"
                aria-label="YouTube"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0" />
                  <path d="m10 15 5-3-5-3z" />
                </svg>
              </a>
            </div>
          </div>

       
          <div className="footer-links-col">
            <h4 className="footer-col-title">Categories</h4>
            <ul className="footer-links-list">
              <li><Link to="/blogs?category=Software+Development">Software Development</Link></li>
              <li>
                <Link to="/blogs?category=Artificial+Intelligence+%26+Machine+Learning">
                  AI &amp; Machine Learning
                </Link>
              </li>
              <li>
                <Link to="/blogs?category=Web+and+Mobile+App+Development">
                  Web &amp; Mobile Apps
                </Link>
              </li>
              <li><Link to="/blogs?category=Cloud+Computing">Cloud Computing</Link></li>
              <li><Link to="/blogs?category=Cybersecurity">Cybersecurity</Link></li>
              <li><Link to="/blogs?category=Technology+%26+Innovation">Technology &amp; Innovation</Link></li>
            </ul>
          </div>

        
          <div className="footer-links-col">
            <h4 className="footer-col-title">Useful Links</h4>
            <ul className="footer-links-list">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/blogs">All Articles</Link></li>
              <li><Link to="/admin">Editorial Admin Panel</Link></li>
              <li>
                <a href={`${SERVER_URL}/sitemap.xml`} target="_blank" rel="noreferrer">
                  XML Sitemap <ArrowUpRight size={12} />
                </a>
              </li>
              <li>
                <a href={`${SERVER_URL}/robots.txt`} target="_blank" rel="noreferrer">
                  robots.txt <ArrowUpRight size={12} />
                </a>
              </li>
            </ul>
          </div>
        </div>

     
        <div className="footer-bottom-bar">
          <p>© {currentYear} ZENVORA. All rights reserved.</p>
          <div className="footer-bottom-links">
            <Link to="/blogs">Privacy &amp; Editorial Policy</Link>
            <span>•</span>
            <Link to="/blogs">Terms of Service</Link>
            <span>•</span>
            <Link to="/admin">Admin Access</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
