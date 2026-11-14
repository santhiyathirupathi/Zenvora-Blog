import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  Search,
  ArrowRight,
  Clock,
  Eye,
  Calendar,
  Layers,
  ChevronRight,
  BookOpen
} from "lucide-react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import "./App.css";

import { API_BASE, SERVER_URL } from "./config";
const defaultCategories = [
  "All",
  "Software Development",
  "Artificial Intelligence & Machine Learning",
  "Web and Mobile App Development",
  "Technology & Innovation",
  "Cybersecurity",
  "Cloud Computing",
  "Industry Insights"
];

function formatImageUrl(image) {
  if (!image) {
    return "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1000&auto=format&fit=crop&q=80";
  }
  return image.startsWith("http") ? image : `${SERVER_URL}${image}`;
}

function formatDate(dateString) {
  if (!dateString) return "Recently published";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

export default function App() {
  const [blogs, setBlogs] = useState([]);
  const [popularBlogs, setPopularBlogs] = useState([]);
  const [categories, setCategories] = useState(defaultCategories);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [blogsRes, popularRes, catRes] = await Promise.all([
        axios.get(`${API_BASE}/blogs?status=published&limit=20`),
        axios.get(`${API_BASE}/blogs/popular?limit=4`),
        axios.get(`${API_BASE}/categories`)
      ]);

      const blogList = blogsRes.data.blogs || [];
      setBlogs(blogList);
      setPopularBlogs(popularRes.data || []);

      if (Array.isArray(catRes.data) && catRes.data.length > 0) {
        setCategories(["All", ...catRes.data.map((c) => c.name)]);
      }
    } catch (err) {
      console.error("Error loading blog data:", err);
    } finally {
      setLoading(false);
    }
  };

 
  const filteredBlogs = useMemo(() => {
    return blogs.filter((blog) => {
      const matchesCategory =
        selectedCategory === "All" || blog.category === selectedCategory;
      const matchesSearch =
        !searchTerm.trim() ||
        blog.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (Array.isArray(blog.tags) &&
          blog.tags.some((tag) =>
            tag.toLowerCase().includes(searchTerm.toLowerCase())
          ));
      return matchesCategory && matchesSearch;
    });
  }, [blogs, selectedCategory, searchTerm]);

  
  const featuredBlog = useMemo(() => {
    return filteredBlogs.find((b) => b.featured) || filteredBlogs[0] || null;
  }, [filteredBlogs]);

 
  const latestBlogs = useMemo(() => {
    if (!featuredBlog) return filteredBlogs;
    return filteredBlogs.filter((b) => b._id !== featuredBlog._id);
  }, [filteredBlogs, featuredBlog]);

  return (
    <div className="home-page-wrapper">
      <Header />

    
      <section className="home-hero-section">
        <div className="container hero-container">
          <h1 className="hero-main-title">
            Engineering Insights, Architecture & Emerging Tech
          </h1>

          <p className="hero-subtitle">
            A corporate publication covering distributed systems, machine learning,
            cloud infrastructure, and best practices for modern technology teams.
          </p>

          
          <div className="hero-search-wrapper">
            <div className="hero-search-bar">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Search articles by title, keywords or technology..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  type="button"
                  className="clear-search-link"
                  onClick={() => setSearchTerm("")}
                >
                  Clear
                </button>
              )}
            </div>
            <Link to="/blogs" className="browse-all-btn">
              <span>View All</span>
              <ArrowRight size={15} />
            </Link>
          </div>

          <div className="category-nav-cluster" id="categories">
            <div className="category-scroll-strip">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`category-pill-btn ${selectedCategory === cat ? "active" : ""}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <main className="container home-content-main">
       
        {featuredBlog && (
          <section className="featured-showcase-section">
            <div className="section-header-row">
              <h2 className="section-heading">Featured Story</h2>
            </div>

            <article className="featured-editorial-card">
              <Link
                to={`/blog/${featuredBlog.slug || featuredBlog._id}`}
                className="featured-media-link"
              >
                <img
                  src={formatImageUrl(featuredBlog.image)}
                  alt={featuredBlog.title}
                  className="featured-cover-img"
                />
              </Link>

              <div className="featured-details-pane">
                <div className="featured-meta-cluster">
                  <span className="meta-item">
                    <Calendar size={14} />
                    {formatDate(featuredBlog.createdAt)}
                  </span>
                  <span className="meta-separator">•</span>
                  <span className="meta-item">
                    <Clock size={14} />
                    {featuredBlog.readingTime || 5} min read
                  </span>
                  {featuredBlog.views > 0 && (
                    <>
                      <span className="meta-separator">•</span>
                      <span className="meta-item">
                        <Eye size={14} />
                        {featuredBlog.views} views
                      </span>
                    </>
                  )}
                </div>

                <h3 className="featured-title">
                  <Link to={`/blog/${featuredBlog.slug || featuredBlog._id}`}>
                    {featuredBlog.title}
                  </Link>
                </h3>

                <p className="featured-description">
                  {featuredBlog.description}
                </p>

                <div className="featured-footer-row">
                  <div className="featured-author-block">
                    <span className="author-name-text">
                      By {featuredBlog.author || "ZENVORA Editorial Team"}
                    </span>
                    {featuredBlog.authorRole && (
                      <span className="author-role-subtext">
                        {featuredBlog.authorRole}
                      </span>
                    )}
                  </div>

                  <Link
                    to={`/blog/${featuredBlog.slug || featuredBlog._id}`}
                    className="read-article-action"
                  >
                    <span>Read Article</span>
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </article>
          </section>
        )}

      
        <section className="latest-articles-section">
          <div className="section-header-row">
            <div className="section-title-wrap">
              <span className="section-eyebrow">
                <Layers size={14} className="accent-icon" />
                Latest Publications
              </span>
              <h2 className="section-heading">
                {selectedCategory === "All"
                  ? "Recent Engineering Posts"
                  : `${selectedCategory} Articles`}
              </h2>
            </div>

            <Link to="/blogs" className="view-more-link">
              <span>Explore all articles</span>
              <ChevronRight size={16} />
            </Link>
          </div>

          {loading ? (
            <div className="loading-state-box">
              <div className="spinner-wheel"></div>
              <p>Loading published articles...</p>
            </div>
          ) : latestBlogs.length === 0 ? (
            <div className="empty-state-box">
              <BookOpen size={40} className="empty-icon" />
              <h3>No articles found</h3>
              <p>Try resetting the search keywords or selecting another category.</p>
              <button
                type="button"
                className="reset-btn"
                onClick={() => {
                  setSelectedCategory("All");
                  setSearchTerm("");
                }}
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="articles-responsive-grid">
              {latestBlogs.slice(0, 6).map((blog) => (
                <article key={blog._id} className="standard-blog-card">
                  <Link
                    to={`/blog/${blog.slug || blog._id}`}
                    className="card-media-wrap"
                  >
                    <img
                      src={formatImageUrl(blog.image)}
                      alt={blog.title}
                      loading="lazy"
                    />
                  </Link>

                  <div className="card-body-wrap">
                    <div className="card-meta-line">
                      <span className="meta-date">
                        <Calendar size={13} />
                        {formatDate(blog.createdAt)}
                      </span>
                      <span className="meta-reading">
                        <Clock size={13} />
                        {blog.readingTime || 4} min read
                      </span>
                    </div>

                    <h3 className="card-post-title">
                      <Link to={`/blog/${blog.slug || blog._id}`}>
                        {blog.title}
                      </Link>
                    </h3>

                    <p className="card-post-excerpt">
                      {blog.description}
                    </p>

                    <div className="card-footer-cluster">
                      <div className="card-author-info">
                        <span className="author-name">
                          {blog.author || "ZENVORA Staff"}
                        </span>
                      </div>

                      <Link
                        to={`/blog/${blog.slug || blog._id}`}
                        className="card-read-link"
                      >
                        Read Post <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        
        <section className="popular-trending-section">
          <div className="section-header-row">
            <h2 className="section-heading">Popular & Trending Articles</h2>
          </div>

          <div className="popular-cards-grid">
            {(popularBlogs.length > 0 ? popularBlogs : blogs.slice(0, 4)).map(
              (popBlog, idx) => (
                <Link
                  key={popBlog._id}
                  to={`/blog/${popBlog.slug || popBlog._id}`}
                  className="popular-trend-card"
                >
                  <div className="trend-number-badge">0{idx + 1}</div>
                  <div className="trend-body">
                    <span className="trend-category-tag">{popBlog.category}</span>
                    <h4 className="trend-title">{popBlog.title}</h4>
                    <div className="trend-metrics">
                      <span>
                        <Eye size={13} />
                        {popBlog.views || 0} views
                      </span>
                      <span>•</span>
                      <span>
                        <Clock size={13} />
                        {popBlog.readingTime || 4} min
                      </span>
                    </div>
                  </div>
                </Link>
              )
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
