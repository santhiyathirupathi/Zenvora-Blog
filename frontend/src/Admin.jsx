import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  Plus,
  Pencil,
  Trash2,
  ArrowLeft,
  Upload,
  X,
  ShieldCheck,
  LogOut,
  LayoutDashboard,
  FileText,
  FolderTree,
  Users,
  Eye,
  CheckCircle,
  Clock,
  Search,
  ExternalLink,
  Sparkles,
  Image as ImageIcon,
  Code,
  Table as TableIcon,
  List,
  Heading2,
  Heading3,
  Quote,
  Bold,
  Italic,
  Link2,
  AlertCircle
} from "lucide-react";
import "./Admin.css";
import { API_BASE, SERVER_URL } from "./config";

const initialForm = {
  title: "",
  slug: "",
  description: "",
  content: "",
  category: "Software Development",
  author: "Tech Editorial Team",
  authorRole: "Technology Specialist",
  authorAvatar: "",
  image: "",
  status: "draft",
  scheduledPublishDate: "",
  featured: false,
  tags: "",
  seoTitle: "",
  seoDescription: ""
};

function getImage(image) {
  if (!image) return "";
  if (image.startsWith("http")) return image;
  return `${SERVER_URL}${image}`;
}

function Admin() {
 
  const [user, setUser] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

 
  const [activeTab, setActiveTab] = useState("dashboard");


  const [blogs, setBlogs] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    draft: 0,
    scheduled: 0,
    totalViews: 0,
    categoriesCount: 0
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");


  const [categories, setCategories] = useState([]);
  const [authors, setAuthors] = useState([]);

 
  const [newCatName, setNewCatName] = useState("");
  const [newCatDesc, setNewCatDesc] = useState("");
  const [editingCatId, setEditingCatId] = useState(null);

  
  const [authorName, setAuthorName] = useState("");
  const [authorRole, setAuthorRole] = useState("");
  const [authorEmail, setAuthorEmail] = useState("");
  const [authorBio, setAuthorBio] = useState("");
  const [editingAuthorId, setEditingAuthorId] = useState(null);


  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [editorPreviewMode, setEditorPreviewMode] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const contentTextareaRef = useRef(null);

 
  useEffect(() => {
    const token = sessionStorage.getItem("techblog_admin_token");
    const savedUser = sessionStorage.getItem("techblog_admin_user");
    if (token && savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      } catch (e) {
        sessionStorage.removeItem("techblog_admin_token");
        sessionStorage.removeItem("techblog_admin_user");
      }
    }
    setAuthChecking(false);
  }, []);


  const loadAdminData = async () => {
    try {
      const [blogsRes, statsRes, catRes, authRes] = await Promise.all([
        axios.get(`${API_BASE}/blogs?status=all&limit=100`),
        axios.get(`${API_BASE}/blogs/stats`),
        axios.get(`${API_BASE}/categories`),
        axios.get(`${API_BASE}/authors`)
      ]);

      setBlogs(blogsRes.data.blogs || []);
      setStats(statsRes.data || {});
      setCategories(catRes.data || []);
      setAuthors(authRes.data || []);
    } catch (err) {
      console.error("Admin load error:", err);
    }
  };

  useEffect(() => {
    if (user) {
      loadAdminData();
    }
  }, [user]);


  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setLoginError("");
    setLoginLoading(true);

    try {
      const emailToSend = loginEmail.trim().toLowerCase();
      const passwordToSend = loginPassword;

      const res = await axios.post(`${API_BASE}/auth/login`, {
        email: emailToSend,
        password: passwordToSend
      });

      const userData = {
        name: res.data.name,
        email: res.data.email,
        role: res.data.role
      };

      sessionStorage.setItem("techblog_admin_token", res.data.token);
      sessionStorage.setItem("techblog_admin_user", JSON.stringify(userData));
      localStorage.setItem("techblog_admin_token", res.data.token);
      localStorage.setItem("techblog_admin_user", JSON.stringify(userData));
      axios.defaults.headers.common["Authorization"] = `Bearer ${res.data.token}`;
      setUser(userData);
    } catch (err) {
      setLoginError(err.response?.data?.message || "Invalid credentials. Please verify.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.clear();
    localStorage.removeItem("techblog_admin_token");
    localStorage.removeItem("techblog_admin_user");
    delete axios.defaults.headers.common["Authorization"];
    setUser(null);
  };

 
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    let updatedValue = type === "checkbox" ? checked : value;

   
    if (name === "title" && !editingId) {
      const autoSlug = value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      setForm((prev) => ({
        ...prev,
        title: value,
        slug: autoSlug
      }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: updatedValue
    }));
  };

 
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setMessage("Only JPG, PNG and WEBP images are supported");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage("File size must be below 5 MB");
      return;
    }

    setSelectedImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const removeSelectedImage = () => {
    setSelectedImage(null);
    setPreview("");
    setForm((prev) => ({ ...prev, image: "" }));
  };

 
  const handleUploadImageInContent = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await axios.post(`${API_BASE}/upload`, formData);
      const imageUrl = res.data.image;

      
      const textarea = contentTextareaRef.current;
      const snippet = `\n![Image description](${imageUrl})\n`;

      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = form.content;
        const newContent = text.substring(0, start) + snippet + text.substring(end);
        setForm((prev) => ({ ...prev, content: newContent }));
      } else {
        setForm((prev) => ({ ...prev, content: prev.content + snippet }));
      }
    } catch (err) {
      setMessage("Failed to upload content image");
    }
  };

  
  const insertMarkdown = (prefix, suffix = "") => {
    const textarea = contentTextareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = form.content.substring(start, end) || "Text";
    const replacement = `${prefix}${selectedText}${suffix}`;

    const newContent =
      form.content.substring(0, start) + replacement + form.content.substring(end);

    setForm((prev) => ({ ...prev, content: newContent }));

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + selectedText.length
      );
    }, 10);
  };


  const handleCreateNew = () => {
    setForm(initialForm);
    setSelectedImage(null);
    setPreview("");
    setEditingId(null);
    setMessage("");
    setActiveTab("editor");
  };


  const handleEdit = (blog) => {
    setEditingId(blog._id);
    setForm({
      title: blog.title || "",
      slug: blog.slug || "",
      description: blog.description || "",
      content: blog.content || "",
      category: blog.category || "Software Development",
      author: blog.author || "Tech Editorial Team",
      authorRole: blog.authorRole || "Technology Specialist",
      authorAvatar: blog.authorAvatar || "",
      image: blog.image || "",
      status: blog.status || "draft",
      scheduledPublishDate: blog.scheduledPublishDate
        ? new Date(blog.scheduledPublishDate).toISOString().slice(0, 16)
        : "",
      featured: Boolean(blog.featured),
      tags: Array.isArray(blog.tags) ? blog.tags.join(", ") : blog.tags || "",
      seoTitle: blog.seoTitle || "",
      seoDescription: blog.seoDescription || ""
    });

    if (blog.image) {
      setPreview(getImage(blog.image));
    } else {
      setPreview("");
    }

    setSelectedImage(null);
    setMessage("");
    setActiveTab("editor");
  };

 
  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      await axios.delete(`${API_BASE}/blogs/${id}`);
      await loadAdminData();
      setMessage("Article deleted successfully");
    } catch (err) {
      setMessage("Failed to delete article");
    }
  };

  
  const handleSubmitArticle = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      let imagePath = form.image;

      
      if (selectedImage) {
        const formData = new FormData();
        formData.append("image", selectedImage);
        const uploadRes = await axios.post(`${API_BASE}/upload`, formData);
        imagePath = uploadRes.data.image;
      }

      const tagsArray = form.tags
        ? form.tags.split(",").map((t) => t.trim()).filter(Boolean)
        : [];

    
      const selectedAuthorObj = authors.find((a) => a.name === form.author);

      const payload = {
        ...form,
        image: imagePath,
        tags: tagsArray,
        authorRole: selectedAuthorObj?.role || form.authorRole,
        authorAvatar: selectedAuthorObj?.avatar || form.authorAvatar
      };

      if (editingId) {
        await axios.put(`${API_BASE}/blogs/${editingId}`, payload);
        setMessage("Article updated successfully!");
      } else {
        await axios.post(`${API_BASE}/blogs`, payload);
        setMessage("Article created successfully!");
      }

      await loadAdminData();
      setActiveTab("dashboard");
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to save article");
    } finally {
      setLoading(false);
    }
  };

  // Category CRUD
  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    try {
      if (editingCatId) {
        await axios.put(`${API_BASE}/categories/${editingCatId}`, {
          name: newCatName,
          description: newCatDesc
        });
        setMessage("Category updated successfully");
      } else {
        await axios.post(`${API_BASE}/categories`, {
          name: newCatName,
          description: newCatDesc
        });
        setMessage("Category created successfully");
      }
      setNewCatName("");
      setNewCatDesc("");
      setEditingCatId(null);
      await loadAdminData();
    } catch (err) {
      setMessage(err.response?.data?.message || "Error saving category");
    }
  };

  const handleDeleteCategory = async (id, name) => {
    if (!window.confirm(`Delete category "${name}"?`)) return;
    try {
      await axios.delete(`${API_BASE}/categories/${id}`);
      await loadAdminData();
      setMessage("Category deleted");
    } catch (err) {
      setMessage("Failed to delete category");
    }
  };


  const handleSaveAuthor = async (e) => {
    e.preventDefault();
    if (!authorName.trim()) return;

    try {
      const payload = {
        name: authorName,
        role: authorRole,
        email: authorEmail,
        bio: authorBio
      };

      if (editingAuthorId) {
        await axios.put(`${API_BASE}/authors/${editingAuthorId}`, payload);
        setMessage("Author updated successfully");
      } else {
        await axios.post(`${API_BASE}/authors`, payload);
        setMessage("Author added successfully");
      }

      setAuthorName("");
      setAuthorRole("");
      setAuthorEmail("");
      setAuthorBio("");
      setEditingAuthorId(null);
      await loadAdminData();
    } catch (err) {
      setMessage(err.response?.data?.message || "Error saving author");
    }
  };

  const handleDeleteAuthor = async (id, name) => {
    if (!window.confirm(`Delete author "${name}"?`)) return;
    try {
      await axios.delete(`${API_BASE}/authors/${id}`);
      await loadAdminData();
      setMessage("Author deleted");
    } catch (err) {
      setMessage("Failed to delete author");
    }
  };

  
  const filteredTableBlogs = blogs.filter((b) => {
    const matchesSearch =
      !searchTerm ||
      b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.author.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || b.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

 
  if (authChecking) {
    return (
      <div className="admin-loading-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="admin-login-layout">
        <div className="login-card">
          <div className="login-header">
            <h1 className="login-brand-title" style={{ fontSize: "28px", fontWeight: "800", letterSpacing: "0.08em", color: "var(--primary)", margin: "0 0 6px" }}>ZENVORA</h1>
            <p style={{ margin: 0, fontSize: "14px", color: "var(--text-muted)", fontWeight: "500" }}>Admin CMS & Editorial Dashboard</p>
          </div>

          {loginError && (
            <div className="login-error-alert">
              <AlertCircle size={16} /> {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px", color: "var(--text-primary)" }}>Admin Email</label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="Enter your email address"
                style={{ width: "100%", padding: "11px 14px", borderRadius: "8px", border: "1px solid var(--border-strong)", fontSize: "14px" }}
              />
            </div>

            <div className="form-group">
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px", color: "var(--text-primary)" }}>Password</label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Enter your password"
                style={{ width: "100%", padding: "11px 14px", borderRadius: "8px", border: "1px solid var(--border-strong)", fontSize: "14px" }}
              />
            </div>

            <button type="submit" className="login-submit-btn" disabled={loginLoading} style={{ background: "var(--primary)", color: "#ffffff", padding: "12px", borderRadius: "8px", fontWeight: "700", fontSize: "14.5px", marginTop: "8px", cursor: "pointer", border: "none" }}>
              {loginLoading ? "Authenticating..." : "Sign In to Admin Dashboard"}
            </button>
          </form>

          <div className="login-footer" style={{ marginTop: "20px", textAlign: "center" }}>
            <Link to="/" style={{ fontSize: "13.5px", color: "var(--text-muted)", textDecoration: "none" }}>← Back to Public Website</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-layout">
     
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <Link to="/" className="sidebar-brand">
            <div className="brand-title">
              <span style={{ fontSize: "20px", fontWeight: "800", letterSpacing: "0.08em", color: "#ffffff" }}>ZENVORA</span>
              <small>ADMIN CMS</small>
            </div>
          </Link>
        </div>

        <nav className="admin-sidebar-nav">
          <button
            className={`nav-btn ${activeTab === "dashboard" ? "active" : ""}`}
            onClick={() => setActiveTab("dashboard")}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
            <span className="nav-badge">{stats.total || blogs.length}</span>
          </button>

          <button
            className={`nav-btn ${activeTab === "editor" ? "active" : ""}`}
            onClick={handleCreateNew}
          >
            <Plus size={18} />
            <span>New Article</span>
          </button>

          <button
            className={`nav-btn ${activeTab === "categories" ? "active" : ""}`}
            onClick={() => setActiveTab("categories")}
          >
            <FolderTree size={18} />
            <span>Categories</span>
            <span className="nav-badge">{categories.length}</span>
          </button>

          <button
            className={`nav-btn ${activeTab === "authors" ? "active" : ""}`}
            onClick={() => setActiveTab("authors")}
          >
            <Users size={18} />
            <span>Authors</span>
            <span className="nav-badge">{authors.length}</span>
          </button>
        </nav>

        <div className="admin-sidebar-footer">
          <div className="user-profile-widget">
            <div className="avatar-circle">{user.name.charAt(0)}</div>
            <div className="user-text">
              <span className="user-name">{user.name}</span>
              <span className="user-role">{user.role}</span>
            </div>
          </div>

          <div className="sidebar-actions">
            <Link to="/" className="sidebar-action-btn" title="View Public Website">
              <ExternalLink size={16} />
            </Link>
            <button onClick={handleLogout} className="sidebar-action-btn logout" title="Sign Out">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      
      <div className="admin-main-viewport">
        {/* Top Operational Bar */}
        <header className="admin-topbar">
          <div className="topbar-title">
            <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "800", color: "var(--text-primary)" }}>
              {activeTab === "dashboard" && "Dashboard"}
              {activeTab === "editor" && (editingId ? "Edit Article" : "Write New Article")}
              {activeTab === "categories" && "Topic & Category Management"}
              {activeTab === "authors" && "Editorial Authors & Contributors"}
            </h2>
            {activeTab === "dashboard" && (
              <span style={{ fontSize: "12.5px", color: "var(--text-muted)", fontWeight: "500", marginTop: "2px", display: "block" }}>
                Overview & Content Performance
              </span>
            )}
          </div>

          <div className="topbar-actions">
            {activeTab !== "editor" && (
              <button onClick={handleCreateNew} className="btn-primary-action">
                <Plus size={16} /> New Article
              </button>
            )}
            <Link to="/" className="view-site-pill">
              View Site <ExternalLink size={14} />
            </Link>
          </div>
        </header>

     
        {message && (
          <div className="admin-message-banner">
            <span>{message}</span>
            <button onClick={() => setMessage("")}>
              <X size={15} />
            </button>
          </div>
        )}

       
        {activeTab === "dashboard" && (
          <div className="admin-content-inner">
            {/* KPI Stats Grid */}
            <div className="kpi-stats-grid">
              <div className="kpi-card">
                <span className="kpi-label">Total Articles</span>
                <span className="kpi-number">{stats.total || blogs.length}</span>
              </div>
              <div className="kpi-card published">
                <span className="kpi-label">Published</span>
                <span className="kpi-number">{stats.published || 0}</span>
              </div>
              <div className="kpi-card draft">
                <span className="kpi-label">Drafts</span>
                <span className="kpi-number">{stats.draft || 0}</span>
              </div>
              <div className="kpi-card scheduled">
                <span className="kpi-label">Scheduled</span>
                <span className="kpi-number">{stats.scheduled || 0}</span>
              </div>
              <div className="kpi-card views">
                <span className="kpi-label">Total Views</span>
                <span className="kpi-number">{stats.totalViews || 0}</span>
              </div>
            </div>

          
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
              <div>
                <h3 style={{ fontSize: "17px", fontWeight: "700", color: "var(--text-primary)", margin: 0 }}>All Published & Draft Articles</h3>
                <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>Manage, edit or publish your technology articles</span>
              </div>
            </div>

       
            <div className="table-toolbar">
              <div className="table-search">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Search articles by title, author, or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="status-filter-pills">
                {["all", "published", "draft", "scheduled"].map((st) => (
                  <button
                    key={st}
                    className={`status-pill ${statusFilter === st ? "active" : ""}`}
                    onClick={() => setStatusFilter(st)}
                  >
                    {st.charAt(0).toUpperCase() + st.slice(1)}
                  </button>
                ))}
              </div>
            </div>

           
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Article</th>
                    <th>Category</th>
                    <th>Author</th>
                    <th>Status</th>
                    <th>Featured</th>
                    <th>Views</th>
                    <th>Date</th>
                    <th className="actions-header">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTableBlogs.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="empty-table-row">
                        No articles found. Click "+ New Article" to write your first post.
                      </td>
                    </tr>
                  ) : (
                    filteredTableBlogs.map((b) => (
                      <tr key={b._id}>
                        <td className="article-title-cell">
                          <div className="table-article-info">
                            <img
                              src={getImage(b.image) || "https://images.unsplash.com/photo-1518770660439-4636190af475?w=100"}
                              alt={b.title}
                              className="table-thumbnail"
                            />
                            <div>
                              <strong className="table-title">{b.title}</strong>
                              <span className="table-slug">/blog/{b.slug}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="table-cat-badge">{b.category}</span>
                        </td>
                        <td>{b.author}</td>
                        <td>
                          <span className={`status-badge ${b.status}`}>
                            {b.status === "published" && "Published"}
                            {b.status === "draft" && "Draft"}
                            {b.status === "scheduled" && "Scheduled"}
                          </span>
                        </td>
                        <td>
                          {b.featured ? (
                            <span className="featured-badge-yes">★ Featured</span>
                          ) : (
                            <span className="featured-badge-no">—</span>
                          )}
                        </td>
                        <td>{b.views || 0}</td>
                        <td className="table-date">
                          {new Date(b.createdAt).toLocaleDateString()}
                        </td>
                        <td className="actions-cell">
                          <Link
                            to={`/blog/${b.slug || b._id}`}
                            className="icon-action-btn"
                            title="View Public Post"
                          >
                            <Eye size={16} />
                          </Link>
                          <button
                            onClick={() => handleEdit(b)}
                            className="icon-action-btn edit"
                            title="Edit Article"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(b._id, b.title)}
                            className="icon-action-btn delete"
                            title="Delete Article"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      
        {activeTab === "editor" && (
          <div className="admin-editor-layout simple-editor">
            <form onSubmit={handleSubmitArticle} className="editor-form">
              <div className="simple-editor-card">
                <div className="simple-editor-heading">
                  <h3>{editingId ? "Edit Article" : "Create New Article"}</h3>
                  <p>Add your article details below.</p>
                </div>

                <div className="form-group">
                  <label>Article Title *</label>
                  <input
                    type="text"
                    name="title"
                    required
                    placeholder="Enter article title"
                    value={form.title}
                    onChange={handleFormChange}
                  />
                </div>

                <div className="form-group">
                  <label>URL Slug *</label>
                  <input
                    type="text"
                    name="slug"
                    required
                    placeholder="article-url"
                    value={form.slug}
                    onChange={handleFormChange}
                  />
                </div>

                <div className="form-group">
                  <label>Short Description *</label>
                  <textarea
                    name="description"
                    required
                    rows="3"
                    placeholder="Write a short description..."
                    value={form.description}
                    onChange={handleFormChange}
                  />
                </div>

                <div className="form-group">
                  <label>Article Content *</label>
                  <textarea
                    name="content"
                    required
                    rows="12"
                    placeholder="Write your complete article here..."
                    value={form.content}
                    onChange={handleFormChange}
                  />
                </div>

                <div className="simple-editor-row">
                  <div className="form-group">
                    <label>Category *</label>
                    <select
                      name="category"
                      value={form.category}
                      onChange={handleFormChange}
                      required
                    >
                      {categories.map((c) => (
                        <option key={c._id || c.name} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Author</label>
                    <select
                      name="author"
                      value={form.author}
                      onChange={handleFormChange}
                    >
                      {authors.map((a) => (
                        <option key={a._id || a.name} value={a.name}>
                          {a.name}
                        </option>
                      ))}
                      <option value="Tech Editorial Team">Tech Editorial Team</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Tags</label>
                  <input
                    type="text"
                    name="tags"
                    placeholder="React, JavaScript, Technology"
                    value={form.tags}
                    onChange={handleFormChange}
                  />
                </div>

                <div className="form-group">
                  <label>Featured Image</label>
                  {preview && (
                    <div className="simple-image-preview">
                      <img src={preview} alt="Article preview" />
                      <button type="button" onClick={removeSelectedImage}>
                        Remove Image
                      </button>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageChange}
                  />
                  <small>JPG, PNG or WEBP. Maximum 5 MB.</small>
                  <input
                    type="text"
                    name="image"
                    placeholder="Or paste image URL"
                    value={form.image}
                    onChange={(e) => {
                      handleFormChange(e);
                      if (e.target.value.startsWith("http")) {
                        setPreview(e.target.value);
                      }
                    }}
                  />
                </div>

                <div className="simple-editor-row">
                  <div className="form-group">
                    <label>Article Status</label>
                    <select
                      name="status"
                      value={form.status}
                      onChange={handleFormChange}
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                    </select>
                  </div>

                  <div className="form-group simple-featured">
                    <label>
                      <input
                        type="checkbox"
                        name="featured"
                        checked={form.featured}
                        onChange={handleFormChange}
                      />
                      Show as Featured Article
                    </label>
                  </div>
                </div>

                <div className="simple-editor-actions">
                  <button
                    type="submit"
                    disabled={loading}
                    className="simple-save-btn"
                  >
                    {loading
                      ? "Saving..."
                      : editingId
                      ? "Update Article"
                      : form.status === "published"
                      ? "Publish Article"
                      : "Save Draft"}
                  </button>
                  <button
                    type="button"
                    className="simple-cancel-btn"
                    onClick={() => setActiveTab("articles")}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

       
        {activeTab === "categories" && (
          <div className="admin-content-inner">
            <div className="management-dual-pane">
              {/* Add / Edit Category Form */}
              <div className="management-form-card">
                <h3>{editingCatId ? "Edit Category" : "Add New Category"}</h3>
                <form onSubmit={handleSaveCategory}>
                  <div className="form-group">
                    <label>Category Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Distributed Systems"
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      rows="3"
                      placeholder="Brief domain overview..."
                      value={newCatDesc}
                      onChange={(e) => setNewCatDesc(e.target.value)}
                    ></textarea>
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="btn-primary-action">
                      {editingCatId ? "Update Category" : "Save Category"}
                    </button>
                    {editingCatId && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCatId(null);
                          setNewCatName("");
                          setNewCatDesc("");
                        }}
                        className="btn-cancel"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>

          
              <div className="management-list-card">
                <h3>Configured Categories ({categories.length})</h3>
                <table className="admin-table simple">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Slug</th>
                      <th>Articles</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((c) => (
                      <tr key={c._id}>
                        <td>
                          <strong>{c.name}</strong>
                          {c.description && <p className="table-subtext">{c.description}</p>}
                        </td>
                        <td>
                          <code>{c.slug}</code>
                        </td>
                        <td>
                          <span className="count-badge">{c.articleCount || 0}</span>
                        </td>
                        <td>
                          <button
                            onClick={() => {
                              setEditingCatId(c._id);
                              setNewCatName(c.name);
                              setNewCatDesc(c.description || "");
                            }}
                            className="icon-action-btn edit"
                            title="Edit"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(c._id, c.name)}
                            className="icon-action-btn delete"
                            title="Delete"
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "authors" && (
          <div className="admin-content-inner">
            <div className="management-dual-pane">
             
              <div className="management-form-card">
                <h3>{editingAuthorId ? "Edit Author" : "Add New Author"}</h3>
                <form onSubmit={handleSaveAuthor}>
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Siddharth Raman"
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Role / Job Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Principal Architect"
                      value={authorRole}
                      onChange={(e) => setAuthorRole(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Corporate Email</label>
                    <input
                      type="email"
                      placeholder="name@zenvora.io"
                      value={authorEmail}
                      onChange={(e) => setAuthorEmail(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Bio Summary</label>
                    <textarea
                      rows="3"
                      placeholder="Brief biographical background..."
                      value={authorBio}
                      onChange={(e) => setAuthorBio(e.target.value)}
                    ></textarea>
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="btn-primary-action">
                      {editingAuthorId ? "Update Author" : "Add Author"}
                    </button>
                    {editingAuthorId && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingAuthorId(null);
                          setAuthorName("");
                          setAuthorRole("");
                          setAuthorEmail("");
                          setAuthorBio("");
                        }}
                        className="btn-cancel"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>

           
              <div className="management-list-card">
                <h3>Editorial Authors ({authors.length})</h3>
                <div className="authors-grid-layout">
                  {authors.map((a) => (
                    <div key={a._id} className="author-admin-card">
                      <img
                        src={
                          a.avatar ||
                          `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(a.name)}`
                        }
                        alt={a.name}
                        className="author-avatar-img"
                      />
                      <div className="author-card-content">
                        <strong>{a.name}</strong>
                        <span className="author-role-label">{a.role}</span>
                        {a.email && <span className="author-email">{a.email}</span>}
                        {a.bio && <p className="author-bio-snippet">{a.bio}</p>}
                      </div>
                      <div className="author-actions">
                        <button
                          onClick={() => {
                            setEditingAuthorId(a._id);
                            setAuthorName(a.name);
                            setAuthorRole(a.role || "");
                            setAuthorEmail(a.email || "");
                            setAuthorBio(a.bio || "");
                          }}
                          className="icon-action-btn edit"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteAuthor(a._id, a.name)}
                          className="icon-action-btn delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Admin;
