import React, { useEffect, useState } from "react";
import { Editor } from "primereact/editor";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import axios from "axios";
import { useParams } from "react-router-dom";
import { apiBaseUrlState } from "../../../recoil/ctaState";
import { useRecoilValue } from "recoil";

const PageBuilder = () => {
  const { slug } = useParams();
  const apiBaseUrl = useRecoilValue(apiBaseUrlState);

  const [pageTitle, setPageTitle] = useState("");
  const [pageSlug, setPageSlug] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔹 slug generator
  const generateSlug = (text) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "") // remove special chars
      .replace(/\s+/g, "-") // spaces to dash
      .replace(/-+/g, "-"); // remove duplicate dashes
  };

  // 🔹 Fetch existing page
  useEffect(() => {
    if (slug) {
      fetchPage();
    }
  }, [slug]);

  const formatTitle = (slug) => {
  return slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

const fetchPage = async () => {
  try {
    setLoading(true);
    const res = await axios.get(`${apiBaseUrl}/page/${slug}`);

    setPageSlug(res.data.pageSlug);
    setContent(res.data.pageContent);

    // 🔥 Generate title from slug
    setPageTitle(formatTitle(res.data.pageSlug));

  } catch (err) {
    console.error("Fetch error:", err);
  } finally {
    setLoading(false);
  }
};

  // 🔹 Handle title change → auto slug
  const handleTitleChange = (value) => {
    setPageTitle(value);

      // only auto-generate in create mode
      setPageSlug(generateSlug(value));
    
  };

  // 🔹 Submit
  const handleSubmit = async () => {
    if (!pageTitle || !content) {
      alert("Title and content required");
      return;
    }

    try {
      const payload = {
        pageTitle,
        pageSlug,
        pageContent: content
      };

      if (slug) {
        await axios.put(`${apiBaseUrl}/page/${slug}`, payload);
        alert("Page updated successfully");
      } else {
        await axios.post(`${apiBaseUrl}/page`, payload);
        alert("Page created successfully");
      }
    } catch (err) {
      console.error("Error:", err);
      alert("Something went wrong");
    }
  };

  return (
    <div className="p-4">
      <div className="dashboard__header_block">
        <h3>{slug ? "Edit Page" : "Create Page"}</h3>
        <a href={window.location.origin + `/page/${pageSlug}`} target="_blank" rel="noopener noreferrer" className="viewPageLink">
          View Page
        </a>
      </div>

      <div className="editor__box_wrap_container">

        {/* 🔹 Title */}
        <div className="editor__box_slug_wrap">
          <label>Page Title</label>
          <InputText
            value={pageTitle}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="w-full"
          />
        </div>

        {/* 🔹 Auto Generated Slug (read-only) */}
        <div className="editor__box_slug_wrap">
          <label>Page Slug</label>
          <p><span>{window.location.origin}/page/</span>{pageSlug}</p>
        </div>

        {/* 🔹 Content */}
        <div className="editor__box_content_wrap">
          <label>Page Content</label>
          <Editor
            value={content}
            onTextChange={(e) => setContent(e.htmlValue)}
            style={{ height: "300px" }}
          />
        </div>

        <Button
          label={slug ? "Update Page" : "Create Page"}
          icon="pi pi-check"
          className="page__content_submit_btn"
          onClick={handleSubmit}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default PageBuilder;