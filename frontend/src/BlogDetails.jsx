import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import {
  Calendar,
  Clock,
  Eye,
  Share2,
  Copy,
  Check,
  ArrowLeft,
  ArrowRight,
  ListFilter,
  CheckCircle2,
  Bookmark,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Terminal,
  BookmarkCheck
} from "lucide-react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import "./BlogDetails.css";
import { API_BASE, SERVER_URL } from "./config";

function formatImageUrl(image) {
  if (!image) {
    return "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=85";
  }
  return image.startsWith("http") ? image : `${SERVER_URL}${image}`;
}

function formatDate(date) {
  if (!date) return "Recently published";
  return new Date(date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  });
}

function slugify(text) {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}


function renderInlineFormatted(text) {
  if (!text) return "";

 
  const parts = [];
  let remaining = text;
  let keyIndex = 0;


  const tokenRegex = /(\[([^\]]+)\]\(([^)]+)\)|`([^`]+)`|\*\*([^*]+)\*\*|\*([^*]+)\*)/g;

  let lastIndex = 0;
  let match;

  while ((match = tokenRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    if (match[2] && match[3]) {
      // Link
      parts.push(
        <a
          key={`link-${keyIndex++}`}
          href={match[3]}
          target={match[3].startsWith("http") ? "_blank" : undefined}
          rel={match[3].startsWith("http") ? "noopener noreferrer" : undefined}
          className="inline-article-link"
        >
          {match[2]}
        </a>
      );
    } else if (match[4]) {
   
      parts.push(
        <code key={`code-${keyIndex++}`} className="inline-code">
          {match[4]}
        </code>
      );
    } else if (match[5]) {
     
      parts.push(<strong key={`bold-${keyIndex++}`}>{match[5]}</strong>);
    } else if (match[6]) {
     
      parts.push(<em key={`italic-${keyIndex++}`}>{match[6]}</em>);
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}


function CodeBlock({ code, language }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error("Copy failed", e);
    }
  };

  return (
    <div className="code-block-wrapper">
      <div className="code-block-header">
        <span className="code-lang-label">
          <Terminal size={13} />
          {language || "code"}
        </span>
        <button
          type="button"
          className="code-copy-btn"
          onClick={handleCopy}
          aria-label="Copy code snippet"
        >
          {copied ? (
            <>
              <Check size={14} className="copy-success-icon" /> Copied!
            </>
          ) : (
            <>
              <Copy size={14} /> Copy Code
            </>
          )}
        </button>
      </div>
      <pre className="code-pre">
        <code>{code}</code>
      </pre>
    </div>
  );
}


function TableBlock({ tableLines }) {
  if (tableLines.length < 2) return null;

  const headerRow = tableLines[0]
    .split("|")
    .map((c) => c.trim())
    .filter((c) => c.length > 0);


  const bodyRows = tableLines
    .slice(tableLines[1].includes("---") ? 2 : 1)
    .map((row) =>
      row
        .split("|")
        .map((c) => c.trim())
        .filter((c) => c.length > 0)
    )
    .filter((row) => row.length > 0);

  return (
    <div className="article-table-wrapper">
      <table className="article-table">
        <thead>
          <tr>
            {headerRow.map((cell, idx) => (
              <th key={idx}>{renderInlineFormatted(cell)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {bodyRows.map((row, rIdx) => (
            <tr key={rIdx}>
              {row.map((cell, cIdx) => (
                <td key={cIdx}>{renderInlineFormatted(cell)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


function ArticleRenderer({ content }) {
  if (!content) return <p>No article content available.</p>;

  const lines = content.split("\n");
  const elements = [];
  let index = 0;
  let inCodeBlock = false;
  let codeBuffer = [];
  let codeLanguage = "";
  let tableBuffer = [];

  const flushTable = () => {
    if (tableBuffer.length > 0) {
      elements.push(
        <TableBlock key={`table-${index++}`} tableLines={[...tableBuffer]} />
      );
      tableBuffer = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

   
    if (line.startsWith("```")) {
      flushTable();
      if (inCodeBlock) {
       
        elements.push(
          <CodeBlock
            key={`code-${index++}`}
            code={codeBuffer.join("\n")}
            language={codeLanguage}
          />
        );
        codeBuffer = [];
        codeLanguage = "";
        inCodeBlock = false;
      } else {
      
        inCodeBlock = true;
        codeLanguage = line.replace("```", "").trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(rawLine);
      continue;
    }


    if (line.startsWith("|") && line.endsWith("|")) {
      tableBuffer.push(line);
      continue;
    } else {
      flushTable();
    }

    
    if (!line) continue;

  
    const youtubeMatch = line.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
    if (youtubeMatch && !line.includes(" ")) {
      const videoId = youtubeMatch[1];
      elements.push(
        <div key={`video-${index++}`} className="article-video-wrapper">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            title="Embedded Video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
      continue;
    }

  
    const imgMatch = line.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (imgMatch) {
      const altText = imgMatch[1];
      const imgUrl = formatImageUrl(imgMatch[2]);
      elements.push(
        <figure key={`img-${index++}`} className="article-figure">
          <img src={imgUrl} alt={altText || "Article illustration"} loading="lazy" />
          {altText && <figcaption className="figure-caption">{altText}</figcaption>}
        </figure>
      );
      continue;
    }

    if (line.startsWith("### ")) {
      const headingText = line.replace("### ", "").trim();
      const headingId = slugify(headingText);
      elements.push(
        <h3 key={`h3-${index++}`} id={headingId} className="article-h3">
          {headingText}
        </h3>
      );
      continue;
    }

    if (line.startsWith("## ")) {
      const headingText = line.replace("## ", "").trim();
      const headingId = slugify(headingText);
      elements.push(
        <h2 key={`h2-${index++}`} id={headingId} className="article-h2">
          {headingText}
        </h2>
      );
      continue;
    }

    if (line.startsWith("# ")) {
      const headingText = line.replace("# ", "").trim();
      const headingId = slugify(headingText);
      elements.push(
        <h2 key={`h1-${index++}`} id={headingId} className="article-h2">
          {headingText}
        </h2>
      );
      continue;
    }

  
    if (line.startsWith("> ")) {
      const quoteText = line.replace(/^>\s*/, "");
      elements.push(
        <blockquote key={`quote-${index++}`} className="article-quote">
          <p>{renderInlineFormatted(quoteText)}</p>
        </blockquote>
      );
      continue;
    }

   
    if (line.startsWith("- ") || line.startsWith("* ")) {
      elements.push(
        <li key={`li-${index++}`} className="article-list-item">
          {renderInlineFormatted(line.substring(2))}
        </li>
      );
      continue;
    }

   
    elements.push(
      <p key={`p-${index++}`} className="article-paragraph">
        {renderInlineFormatted(line)}
      </p>
    );
  }

  flushTable();

  return <div className="article-rendered-body">{elements}</div>;
}

export default function BlogDetails() {
  const { id } = useParams();

  const [blog, setBlog] = useState(null);
  const [related, setRelated] = useState([]);
  const [previousBlog, setPreviousBlog] = useState(null);
  const [nextBlog, setNextBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [scrollProgress, setScrollProgress] = useState(0);
  const [linkCopied, setLinkCopied] = useState(false);


  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await axios.get(`${API_BASE}/blogs/${id}`);

        const blogData = res.data.blog || res.data;
        setBlog(blogData);
        setRelated(res.data.related || []);
        setPreviousBlog(res.data.previousBlog || null);
        setNextBlog(res.data.nextBlog || null);

        
        const pageTitle = blogData.seoTitle || blogData.title;
        document.title = `${pageTitle} | ZENVORA`;

    
        let metaDesc = document.querySelector('meta[name="description"]');
        if (!metaDesc) {
          metaDesc = document.createElement("meta");
          metaDesc.name = "description";
          document.head.appendChild(metaDesc);
        }
        metaDesc.content =
          blogData.seoDescription || blogData.description || pageTitle;

     
        const updateOg = (property, content) => {
          let og = document.querySelector(`meta[property="${property}"]`);
          if (!og) {
            og = document.createElement("meta");
            og.setAttribute("property", property);
            document.head.appendChild(og);
          }
          og.content = content;
        };

        updateOg("og:title", pageTitle);
        updateOg("og:description", blogData.seoDescription || blogData.description);
        updateOg("og:image", formatImageUrl(blogData.image));
        updateOg("og:url", window.location.href);

        const scriptId = "zenvora-jsonld-schema";
        let scriptTag = document.getElementById(scriptId);
        if (!scriptTag) {
          scriptTag = document.createElement("script");
          scriptTag.id = scriptId;
          scriptTag.type = "application/ld+json";
          document.head.appendChild(scriptTag);
        }
        const schemaData = {
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          "headline": blogData.title,
          "description": blogData.description,
          "image": formatImageUrl(blogData.image),
          "datePublished": blogData.createdAt,
          "dateModified": blogData.updatedAt || blogData.createdAt,
          "author": {
            "@type": "Person",
            "name": blogData.author || "ZENVORA Editorial Team"
          },
          "publisher": {
            "@type": "Organization",
            "name": "ZENVORA",
            "logo": {
              "@type": "ImageObject",
              "url": `${SERVER_URL}/favicon.svg`
            }
          },
          "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": window.location.href
          }
        };
        scriptTag.text = JSON.stringify(schemaData);
      } catch (err) {
        console.error("Error loading article:", err);
        setError("Unable to load the requested article.");
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
    window.scrollTo(0, 0);

    return () => {
      
      const schemaTag = document.getElementById("zenvora-jsonld-schema");
      if (schemaTag) schemaTag.remove();
    };
  }, [id]);

  
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll =
        document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        const currentProgress = (window.scrollY / totalScroll) * 100;
        setScrollProgress(Math.min(100, Math.max(0, currentProgress)));
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);


  const tableOfContents = useMemo(() => {
    if (!blog?.content) return [];
    const lines = blog.content.split("\n");
    const headings = [];

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (trimmed.startsWith("## ")) {
        const title = trimmed.replace("## ", "").trim();
        headings.push({
          id: slugify(title),
          title,
          level: 2
        });
      } else if (trimmed.startsWith("### ")) {
        const title = trimmed.replace("### ", "").trim();
        headings.push({
          id: slugify(title),
          title,
          level: 3
        });
      }
    });

    return headings;
  }, [blog]);


  const currentUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareTitle = blog ? encodeURIComponent(blog.title) : "";
  const shareUrlEncoded = encodeURIComponent(currentUrl);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share && blog) {
      try {
        await navigator.share({
          title: blog.title,
          text: blog.description,
          url: window.location.href
        });
      } catch (err) {
        // user cancelled share
      }
    } else {
      handleCopyLink();
    }
  };

  if (loading) {
    return (
      <div className="article-page-container">
        <Header />
        <div className="article-loading-state">
          <div className="article-spinner"></div>
          <p>Loading editorial article...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="article-page-container">
        <Header />
        <div className="article-error-state">
          <h2>Article Not Found</h2>
          <p>{error || "The article you are looking for does not exist or has been removed."}</p>
          <Link to="/blogs" className="back-to-blogs-btn">
            <ArrowLeft size={16} /> Return to Articles
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const wordCount = (blog.content || "").trim().split(/\s+/).length;
  const readingTime = blog.readingTime || Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="article-page-container">
     
      <div
        className="reading-progress-bar"
        style={{ width: `${scrollProgress}%` }}
      />

      <Header />

    
      <header className="article-editorial-header">
        <div className="article-header-inner">
          <h1 className="article-main-title">{blog.title}</h1>

          {blog.description && (
            <p className="article-standfirst">{blog.description}</p>
          )}

          <div className="article-meta-cluster">
            <div className="author-meta-block">
              <div className="author-detail-text">
                <span className="author-name-text">
                  By {blog.author || "ZENVORA Editorial Team"}
                </span>
                {blog.authorRole && (
                  <span className="author-role-text">
                    {blog.authorRole}
                  </span>
                )}
              </div>
            </div>

            <div className="article-metrics-block">
              <span className="metric-pill">
                <Calendar size={14} />
                {formatDate(blog.createdAt)}
              </span>
              <span className="metric-pill">
                <Clock size={14} />
                {readingTime} min read
              </span>
              {blog.views > 0 && (
                <span className="metric-pill">
                  <Eye size={14} />
                  {blog.views} views
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

     
      <div className="article-cover-wrapper">
        <img
          src={formatImageUrl(blog.image)}
          alt={blog.title}
          className="article-hero-image"
          onError={(e) => {
            e.target.src =
              "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200";
          }}
        />
      </div>

      <div className="article-container article-body-layout">
     
        <div className="article-content-main">
         
          {tableOfContents.length >= 2 && (
            <div className="mobile-toc-box">
              <div className="toc-widget-header">
                <ListFilter size={16} />
                <span>Table of Contents</span>
              </div>
              <ul className="toc-list">
                {tableOfContents.map((heading) => (
                  <li
                    key={heading.id}
                    className={`toc-item level-${heading.level}`}
                  >
                    <a href={`#${heading.id}`}>{heading.title}</a>
                  </li>
                ))}
              </ul>
            </div>
          )}

       
          <ArticleRenderer content={blog.content} />

        
          {Array.isArray(blog.tags) && blog.tags.length > 0 && (
            <div className="article-tags-wrap">
              <span className="tags-label">Related Topics:</span>
              {blog.tags.map((tag, i) => (
                <Link
                  key={i}
                  to={`/blogs?search=${encodeURIComponent(tag)}`}
                  className="article-tag"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}

         
          <div className="article-share-strip">
            <span className="share-strip-title">Share this article:</span>
            <div className="share-buttons-group">
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrlEncoded}`}
                target="_blank"
                rel="noreferrer"
                className="share-icon-btn linkedin"
                aria-label="Share on LinkedIn"
              >
                in
              </a>

              <a
                href={`https://twitter.com/intent/tweet?url=${shareUrlEncoded}&text=${shareTitle}`}
                target="_blank"
                rel="noreferrer"
                className="share-icon-btn twitter"
                aria-label="Share on Twitter"
              >
                𝕏
              </a>

              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrlEncoded}`}
                target="_blank"
                rel="noreferrer"
                className="share-icon-btn facebook"
                aria-label="Share on Facebook"
              >
                f
              </a>

              <button
                type="button"
                className="share-pill-btn"
                onClick={handleCopyLink}
              >
                {linkCopied ? (
                  <>
                    <Check size={14} /> Link Copied
                  </>
                ) : (
                  <>
                    <Copy size={14} /> Copy Link
                  </>
                )}
              </button>

              <button
                type="button"
                className="share-pill-btn"
                onClick={handleNativeShare}
              >
                <Share2 size={14} /> Share
              </button>
            </div>
          </div>

      
          <div className="article-author-card">
            <div className="author-bio-content">
              <span className="author-bio-label">Written by</span>
              <h4 className="author-bio-name">
                {blog.author || "ZENVORA Editorial Team"}
              </h4>
              <p className="author-bio-role">
                {blog.authorRole || "Technology Specialist"}
              </p>
              <p className="author-bio-desc">
                Contributing insights on software development, cloud infrastructure, AI models,
                and scalable software engineering practices at ZENVORA.
              </p>
            </div>
          </div>

        
          {(previousBlog || nextBlog) && (
            <div className="prev-next-nav-section">
              {previousBlog ? (
                <Link
                  to={`/blog/${previousBlog.slug || previousBlog._id}`}
                  className="nav-card prev-card"
                >
                  <span className="nav-direction">
                    <ChevronLeft size={14} /> Previous Article
                  </span>
                  <span className="nav-card-title">{previousBlog.title}</span>
                </Link>
              ) : (
                <div className="nav-card-empty" />
              )}

              {nextBlog ? (
                <Link
                  to={`/blog/${nextBlog.slug || nextBlog._id}`}
                  className="nav-card next-card"
                >
                  <span className="nav-direction">
                    Next Article <ChevronRight size={14} />
                  </span>
                  <span className="nav-card-title">{nextBlog.title}</span>
                </Link>
              ) : (
                <div className="nav-card-empty" />
              )}
            </div>
          )}
        </div>

      
        <aside className="article-editorial-sidebar">
          {tableOfContents.length >= 2 && (
            <div className="sidebar-widget toc-widget">
              <div className="toc-widget-header">
                <ListFilter size={15} />
                <span>Table of Contents</span>
              </div>
              <ul className="toc-list">
                {tableOfContents.map((heading) => (
                  <li
                    key={heading.id}
                    className={`toc-item level-${heading.level}`}
                  >
                    <a href={`#${heading.id}`}>{heading.title}</a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="sidebar-widget share-widget">
            <h4>Share this story</h4>
            <div className="sidebar-share-cluster">
              <button
                type="button"
                className="sidebar-share-action"
                onClick={handleCopyLink}
              >
                {linkCopied ? (
                  <>
                    <Check size={14} /> Copied to clipboard!
                  </>
                ) : (
                  <>
                    <Copy size={14} /> Copy Article Link
                  </>
                )}
              </button>

              <div className="sidebar-share-icons">
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrlEncoded}`}
                  target="_blank"
                  rel="noreferrer"
                  title="Share on LinkedIn"
                >
             
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?url=${shareUrlEncoded}&text=${shareTitle}`}
                  target="_blank"
                  rel="noreferrer"
                  title="Share on X"
                >
                  𝕏
                </a>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrlEncoded}`}
                  target="_blank"
                  rel="noreferrer"
                  title="Share on Facebook"
                >
                  FB
                </a>
              </div>
            </div>
          </div>
        </aside>
      </div>

    
      {related.length > 0 && (
        <section className="related-articles-section">
          <div className="article-container">
            <div className="related-header">
              <h2>Related Articles</h2>
            </div>

            <div className="related-cards-grid">
              {related.map((relBlog) => (
                <article key={relBlog._id} className="related-card">
                  <Link
                    to={`/blog/${relBlog.slug || relBlog._id}`}
                    className="related-image-link"
                  >
                    <img
                      src={formatImageUrl(relBlog.image)}
                      alt={relBlog.title}
                      loading="lazy"
                    />
                  </Link>

                  <div className="related-body">
                    <span className="related-date">
                      {formatDate(relBlog.createdAt)}
                    </span>
                    <h3>
                      <Link to={`/blog/${relBlog.slug || relBlog._id}`}>
                        {relBlog.title}
                      </Link>
                    </h3>
                    <p>{relBlog.description}</p>
                    <Link
                      to={`/blog/${relBlog.slug || relBlog._id}`}
                      className="related-read-link"
                    >
                      Read Story <ArrowRight size={13} />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
