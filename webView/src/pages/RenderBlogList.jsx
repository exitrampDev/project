import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { apiBaseUrlState } from "../recoil/ctaState";
import { useRecoilValue } from "recoil";
import Header from "../components/Header";
import Footer from "../components/Footer";

const BlogList = () => {
  const apiBaseUrl = useRecoilValue(apiBaseUrlState);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        // Adjust this endpoint based on your actual backend route for all blogs
        const res = await axios.get(`${apiBaseUrl}/blog`); 
        setBlogs(res.data);
      } catch (err) {
        console.error("Error fetching blogs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, [apiBaseUrl]);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
        <p>Loading blogs...</p>
      </div>
    );
  }

  return (
    <>
      <Header />
      
      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem 1rem" }}>
        <h1 className="blog__content_post">
          Our Latest Stories
        </h1>

        {blogs.length === 0 ? (
          <p style={{ textAlign: "center", color: "#6b7280" }}>No blog posts available.</p>
        ) : (
          /* Responsive CSS Grid without needing a separate stylesheet */
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", 
            gap: "2rem" 
          }}>
            {blogs.map((blog) => (
              <article 
                key={blog._id} 
                style={{ 
                  display: "flex", 
                  flexDirection: "column",
                  background: "#fff", 
                  borderRadius: "0.75rem", 
                  overflow: "hidden", 
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  border: "1px solid #e5e7eb"
                }}
              >
                {/* Fallback pattern for thumbnail images */}
                <div style={{ background: "#f3f4f6", height: "200px", overflow: "hidden" }}>
                  <img 
                    src={blog.thumbnail || "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=500&auto=format&fit=crop&q=60"} 
                    alt={blog.title} 
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>

                {/* Content Area */}
                <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", flexGrow: 1 }}>
                  {/* Category badging */}
                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.75rem" }}>
                    {blog.categories && blog.categories.slice(0, 2).map((cat, i) => (
                      <span key={i} style={{ textTransform: "uppercase", fontSize: "0.7rem", color: "#4f46e5", fontWeight: "700", tracking: "wider" }}>
                        {cat}
                      </span>
                    ))}
                  </div>

                  {/* Title linking to Single Page */}
                  <h2 style={{ fontSize: "1.35rem", fontWeight: "700", color: "#111827", margin: "0 0 0.75rem 0", lineHeight: "1.3" }}>
                    <Link to={`/insight/${blog.pageSlug}`} style={{ textDecoration: "none", color: "inherit" }}>
                      {blog.title}
                    </Link>
                  </h2>

                  {/* Clean snippet representation */}
                  <p style={{ color: "#4b5563", fontSize: "0.95rem", lineHeight: "1.5", margin: "0 0 1.5rem 0", flexGrow: 1 }}>
                    {blog.summary ? blog.summary.replace(/<[^>]*>/g, "").substring(0, 120) + "..." : "No summary available."}
                  </p>

                  {/* Footer Meta Details */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.85rem", color: "#6b7280", borderTop: "1px solid #f3f4f6", paddingTop: "1rem" }}>
                    <span>By <strong>{blog.author && blog.author.trim() !== "" ? blog.author : "Anonymous"}</strong></span>
                    <span>{new Date(blog.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </>
  );
};

export default BlogList;