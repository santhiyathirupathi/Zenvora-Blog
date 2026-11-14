import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Link, useSearchParams } from "react-router-dom";
import {
  Search,
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  X,
  BookOpen,
  ArrowRight,
  Filter,
  ArrowUpDown,
  RotateCcw
} from "lucide-react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { API_BASE, SERVER_URL } from "./config";
import "./BlogList.css";

const API = `${API_BASE}/blogs`;
const CAT_API = `${API_BASE}/categories`;
const SERVER = SERVER_URL;

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
  return image.startsWith("http") ? image : `${SERVER}${image}`;
}

function formatDate(date) {
  if (!date) return "Recently published";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

export default function BlogList() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState(defaultCategories);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "All");
  const [sort, setSort] = useState("newest");
  const [navMode, setNavMode] = useState("pagination"); // "pagination" | "loadMore"
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBlogs, setTotalBlogs] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

 
  useEffect(() => {
    const urlCat = searchParams.get("category");
    const urlSearch = searchParams.get("search");
    if (urlCat && urlCat !== category) {
      setCategory(urlCat);
    }
    if (urlSearch !== null && urlSearch !== search) {
      setSearch(urlSearch);
    }
  }, [searchParams]);


  useEffect(() => {
    axios
      .get(CAT_API)
      .then((res) => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          setCategories(["All", ...res.data.map((c) => c.name)]);
        }
      })
      .catch((err) => console.error("Error loading categories:", err));
  }, []);

 
  useEffect(() => {
    const params = {
      status: "published",
      page,
      limit: 6,
      sort
    };

    if (category !== "All") params.category = category;
    if (search.trim()) params.search = search.trim();

    let isActive = true;

    if (page === 1 || navMode === "pagination") {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    axios
      .get(API, { params })
      .then((res) => {
        if (!isActive) return;
        const newBlogs = res.data.blogs || [];

        if (navMode === "loadMore" && page > 1) {
          setBlogs((prev) => [...prev, ...newBlogs]);
        } else {
          setBlogs(newBlogs);
        }

        setTotalPages(res.data.totalPages || 1);
        setTotalBlogs(res.data.total || newBlogs.length);
      })
      .catch((err) => {
        if (isActive) {
          console.error("Blog fetch error:", err);
          if (page === 1) setBlogs([]);
        }
      })
      .finally(() => {
        if (isActive) {
          setLoading(false);
          setLoadingMore(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [page, category, search, sort, navMode]);

 
  const handleSearchChange = (val) => {
    setSearch(val);
    setPage(1);

    const params = {};
    if (val.trim()) params.search = val.trim();
    if (category !== "All") params.category = category;
    setSearchParams(params);
  };

 
  const handleCategorySelect = (selectedCat) => {
    setCategory(selectedCat);
    setPage(1);

    const params = {};
    if (selectedCat !== "All") params.category = selectedCat;
    if (search.trim()) params.search = search.trim();
    setSearchParams(params);
  };


  const clearFilters = () => {
    setSearch("");
    setCategory("All");
    setSort("newest");
    setPage(1);
    setSearchParams({});
  };

  
  const changePage = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
    window.scrollTo({ top: 120, behavior: "smooth" });
  };


  const handleLoadMore = () => {
    if (page < totalPages) {
      setPage((prev) => prev + 1);
    }
  };


  const pageNumbers = useMemo(() => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, page - 2);
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }, [page, totalPages]);

  return (
    <div className="blog-archive-page">
      <Header />

     
      <section className="archive-hero-banner">
        <div className="archive-container">
          <span className="archive-eyebrow">ZENVORA Articles & Tutorials</span>
          <h1 className="archive-title">Browse Engineering Insights</h1>
          <p className="archive-subtitle">
            Explore comprehensive guides, architecture deep-dives, and updates across software engineering, cloud, AI, and cybersecurity.
          </p>

          <div className="archive-search-box">
            <Search size={18} className="search-box-icon" />
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search published articles by keyword or topic..."
              aria-label="Search articles"
            />
            {search && (
              <button
                type="button"
                className="clear-search-btn"
                onClick={() => handleSearchChange("")}
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      </section>

     
      <main className="archive-container archive-main-content">
     
        <div className="category-filter-strip">
          <div className="category-scroll-wrapper">
            {categories.map((cat) => (
              <button
                type="button"
                key={cat}
                className={`filter-pill ${category === cat ? "active" : ""}`}
                onClick={() => handleCategorySelect(cat)}
              >
                <span>{cat}</span>
              </button>
            ))}
          </div>
        </div>

      
        <div className="filter-sort-bar">
          <div className="result-stats">
            <span>
              Showing <strong className="highlight-count">{totalBlogs}</strong>{" "}
              {totalBlogs === 1 ? "article" : "articles"}
              {category !== "All" && ` in ${category}`}
            </span>
            {(search || category !== "All") && (
              <button type="button" className="reset-filter-tag" onClick={clearFilters}>
                <RotateCcw size={12} /> Clear filters
              </button>
            )}
          </div>

          <div className="filter-controls-right">
          
            <div className="nav-mode-toggle">
              <button
                type="button"
                className={`mode-btn ${navMode === "pagination" ? "active" : ""}`}
                onClick={() => {
                  setNavMode("pagination");
                  setPage(1);
                }}
              >
                Pagination
              </button>
              <button
                type="button"
                className={`mode-btn ${navMode === "loadMore" ? "active" : ""}`}
                onClick={() => {
                  setNavMode("loadMore");
                  setPage(1);
                }}
              >
                Load More
              </button>
            </div>

        
            <div className="sort-controls">
              <label htmlFor="sort-select">
                <ArrowUpDown size={14} /> Sort:
              </label>
              <select
                id="sort-select"
                className="sort-dropdown"
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value);
                  setPage(1);
                }}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>
          </div>
        </div>

       
        {loading ? (
          <div className="archive-loading-box">
            <div className="archive-spinner"></div>
            <p>Loading articles...</p>
          </div>
        ) : blogs.length === 0 ? (
          <div className="archive-empty-box">
            <BookOpen size={44} className="empty-icon" />
            <h3>No articles found</h3>
            <p>
              We couldn't find any articles matching your search criteria. Try a different keyword or view all categories.
            </p>
            <button type="button" className="reset-search-btn" onClick={clearFilters}>
              View All Articles
            </button>
          </div>
        ) : (
          <>
        
            <div className="archive-cards-grid">
              {blogs.map((blog) => (
                <article className="archive-card" key={blog._id}>
                  <Link
                    to={`/blog/${blog.slug || blog._id}`}
                    className="card-image-link"
                  >
                    <img
                      src={formatImageUrl(blog.image)}
                      alt={blog.title}
                      className="card-image"
                      loading="lazy"
                    />
                  </Link>

                  <div className="card-body">
                    <div className="card-meta">
                      <span>
                        <Calendar size={13} />
                        {formatDate(blog.createdAt)}
                      </span>
                      <span>•</span>
                      <span>
                        <Clock size={13} />
                        {blog.readingTime || 4} min read
                      </span>
                    </div>

                    <h2 className="card-title">
                      <Link to={`/blog/${blog.slug || blog._id}`}>
                        {blog.title}
                      </Link>
                    </h2>

                    <p className="card-desc">
                      {blog.description}
                    </p>

                    <div className="card-footer">
                      <div className="card-author">
                        <span className="author-name">
                          By {blog.author || "ZENVORA Staff"}
                        </span>
                      </div>

                      <Link
                        to={`/blog/${blog.slug || blog._id}`}
                        className="read-more-link"
                      >
                        Read Post <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>

      
            {navMode === "pagination" && totalPages > 1 && (
              <div className="pagination-wrapper">
                <div className="page-numbers-container">
                  <button
                    type="button"
                    className="page-btn prev-btn"
                    onClick={() => changePage(page - 1)}
                    disabled={page === 1}
                    aria-label="Previous page"
                  >
                    <ChevronLeft size={16} />
                    <span>Previous</span>
                  </button>

                  {pageNumbers.map((p) => (
                    <button
                      type="button"
                      key={p}
                      className={`page-num-btn ${page === p ? "active" : ""}`}
                      onClick={() => changePage(p)}
                    >
                      {p}
                    </button>
                  ))}

                  <button
                    type="button"
                    className="page-btn next-btn"
                    onClick={() => changePage(page + 1)}
                    disabled={page === totalPages}
                    aria-label="Next page"
                  >
                    <span>Next</span>
                    <ChevronRight size={16} />
                  </button>
                </div>
                <span className="pagination-info">
                  Page {page} of {totalPages}
                </span>
              </div>
            )}

            {navMode === "loadMore" && page < totalPages && (
              <div className="load-more-wrapper">
                <button
                  type="button"
                  className="load-more-btn"
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                >
                  {loadingMore ? "Loading more articles..." : `Load More Articles (${totalBlogs - blogs.length} remaining)`}
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
