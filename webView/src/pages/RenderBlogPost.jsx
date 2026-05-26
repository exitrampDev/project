import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { apiBaseUrlState } from "../recoil/ctaState";
import { useRecoilValue } from "recoil";
import Header from "../components/Header";
import Footer from "../components/Footer";

// Simple fallback CSS injection for standard blog typography formatting
const typographyStyles = `
  .blog-content p { margin-bottom: 1.25rem; line-height: 1.75; color: #374151; font-size: 1.125rem; }
  .blog-content code { background-color: #f3f4f6; padding: 0.2rem 0.4rem; border-radius: 0.25rem; font-family: monospace; font-size: 0.875rem; color: #eb5757; }
  .blog-content pre { background-color: #1f2937; color: #f9fafb; padding: 1rem; border-radius: 0.5rem; overflow-x: auto; margin-bottom: 1.5rem; }
  .blog-tags span { display: inline-block; background: #eff6ff; color: #1d4ed8; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.875rem; font-weight: 500; margin-right: 0.5rem; }
`;

const RenderBlogPost = () => {
  const { slug } = useParams();
  const apiBaseUrl = useRecoilValue(apiBaseUrlState);

  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPage = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${apiBaseUrl}/blog/${slug}`);
        setPageData(res.data);
      } catch (err) {
        console.error("Error fetching page:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPage();
  }, [slug, apiBaseUrl]);

  // Handle native head DOM modifications cleanly
  useEffect(() => {
    if (!pageData) return;

    // 1. Update Title
    document.title = pageData.title || "Default Title";

    // 2. Update Description (Strips HTML safely inside the hook context)
    let metaDescription = document.querySelector('meta[name="description"]');
    const rawSummary = pageData.summary || "";
    const cleanSummary = rawSummary.replace(/<[^>]*>/g, "").substring(0, 160); // standard SEO max character count limit
    
    if (cleanSummary) {
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.name = "description";
        document.head.appendChild(metaDescription);
      }
      metaDescription.setAttribute("content", cleanSummary);
    }

    // 3. Update Tags (Keywords Meta Tag)
    if (pageData.tags && pageData.tags.length > 0) {
      let metaKeywords = document.querySelector('meta[name="keywords"]');
      if (!metaKeywords) {
        metaKeywords = document.createElement('meta');
        metaKeywords.name = "keywords";
        document.head.appendChild(metaKeywords);
      }
      metaKeywords.setAttribute("content", pageData.tags.join(", "));
    }

    return () => {
      document.title = "My App Default Title";
    };
  }, [pageData]);

  if (loading) return <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}><p>Loading post...</p></div>;
  if (!pageData) return <div style={{ textAlign: "center", padding: "4rem" }}><p>Post not found.</p></div>;

  return (
    <>
      <style>{typographyStyles}</style>
      <Header />
      
      <article className="page__builder_wrapper">
        {/* Post Metadata Header Block */}
        <header className="header__post_single">
          {pageData.categories && pageData.categories.map((cat, i) => (
            <span key={i} style={{ textTransform: "uppercase", fontSize: "0.75rem", tracking: "wider", color: "#4f46e5", fontWeight: "700" }}>{cat}</span>
          ))}
          
          <h1 style={{ fontSize: "2.5rem", fontWeight: "800", color: "#111827", marginTop: "0.5rem", marginBottom: "1rem", lineHeight: "1.2" }}>
            {pageData.title}
          </h1>
          
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", color: "#6b7280", fontSize: "0.95rem" }}>
            <span>By <strong>{pageData.author || "Anonymous"}</strong></span>
            {pageData.tool && <span>• Tool: <em>{pageData.tool}</em></span>}
          </div>
        </header>

        {/* Thumbnail Image Render */}
        {pageData.thumbnail && (
          <div style={{ marginBottom: "2rem", borderRadius: "0.75rem", overflow: "hidden", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}>
            <img 
              src={pageData.thumbnail} 
              alt={pageData.title} 
              style={{ width: "100%", height: "auto", display: "block", maxHeight: "400px", objectFit: "cover" }} 
            />
          </div>
        )}

        {/* Dynamic Blog Markup Body */}
        <div 
          className="blog-content" 
          dangerouslySetInnerHTML={{ __html: pageData.pageContent || "<p>Empty page</p>" }} 
        />

        {/* Visual Tag Section Footnotes */}
        {pageData.tags && pageData.tags.length > 0 && (
          <footer style={{ marginTop: "3rem", paddingTop: "1.5rem", borderTop: "1px solid #e5e7eb" }}>
            <div className="blog-tags">
              {pageData.tags.map((tag, idx) => (
                <span key={idx}>#{tag}</span>
              ))}
            </div>
          </footer>
        )}
      </article>

      <Footer />
    </>
  );
};

export default RenderBlogPost;