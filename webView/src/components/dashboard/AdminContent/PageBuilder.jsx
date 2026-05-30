import React, { useEffect, useState } from "react";
import { Toast } from "primereact/toast";
import { useRef } from "react";
import { Editor } from "primereact/editor";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { Chips } from "primereact/chips";
import axios from "axios";
import { useParams } from "react-router-dom";
import { apiBaseUrlState } from "../../../recoil/ctaState";
import { useRecoilValue } from "recoil";

const PageBuilder = () => {
  const { slug } = useParams();
  const apiBaseUrl = useRecoilValue(apiBaseUrlState);
const toast = useRef(null);
  // Existing Fields
  const [pageTitle, setPageTitle] = useState("");
  const [pageSlug, setPageSlug] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  // New Fields from Payload
  const [category, setCategory] = useState(null);
  const [tags, setTags] = useState([]);
  const [summary, setSummary] = useState("");
  const [tool, setTool] = useState(null);

  // Mock Options for Dropdowns (Replace with API data if needed)
  const categoryOptions = [
    { label: "Seller Journey", value: "Seller Journey" },
    { label: "Buyer Journey", value: "Buyer Journey" },
    { label: "M&A Experts", value: "M&A Experts" },
    { label: "Platform", value: "Platform" }
  ];

  const toolOptions = [
    { label: "Selling", value: "Selling" },
    { label: "Buying", value: "Buying" },
    { label: "Experts", value: "Experts" }
  ];

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

  const fetchPage = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${apiBaseUrl}/page/${slug}`);
      const data = res.data;

      setPageSlug(data.pageSlug);
      setContent(data.pageContent);
      setPageTitle(data.title || ""); 
      
      // Map incoming array data back to state hooks safely
      setCategory(data.categories && data.categories.length > 0 ? data.categories[0] : null);
      setTags(data.tags || []);
      setSummary(data.summary || "");
      setTool(data.tool || null);

    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Handle title change → auto slug
  const handleTitleChange = (value) => {
    setPageTitle(value);
    // Only auto-generate slug in create mode to preserve existing URLs
    if (!slug) {
      setPageSlug(generateSlug(value));
    }
  };

  // 🔹 Submit
  const handleSubmit = async () => {
    if (!pageTitle || !content) {
      toast.current.show({
  severity: "warn",
  summary: "Validation Error",
  detail: "Title and content required",
  life: 3000,
});
      return;
    }

    try {
      // Form structural payload mapping arrays correctly
      const payload = {
        title: pageTitle,
        pageSlug: pageSlug,
        pageContent: content,
        categories: category ? [category] : [], // backend schema expects array
        tags: tags,
        summary: summary,
        tool: tool
      };

      if (slug) {
        await axios.put(`${apiBaseUrl}/page/${slug}`, payload);
        toast.current.show({
          severity: "success",
          summary: "Success",
          detail: "Page updated successfully",
          life: 3000,
        });
      } else {
        await axios.post(`${apiBaseUrl}/page`, payload);
        toast.current.show({
          severity: "success",
          summary: "Success",
          detail: "Page created successfully",
          life: 3000,
        });
      }
    } catch (err) {
      console.error("Error:", err);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Something went wrong",
        life: 3000,
      });
    }
  };

  return (<>
  <Toast ref={toast} />
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
          <label className="font-bold block mb-2">Page Title</label>
          <InputText
            value={pageTitle}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="w-full"
          />
        </div>

        {/* 🔹 Auto Generated Slug (read-only) */}
        <div className="editor__box_slug_wrap">
          <label className="font-bold block mb-2">Page Slug</label>
          <p><span>{window.location.origin}/page/</span>{pageSlug}</p>
        </div>

{/* 🔹 Tags (Chips Component) */}
        <div className="editor__box_slug_wrap">
          <label className="font-bold block mb-2">Meta keywords</label>
          <Chips 
            value={tags} 
            onChange={(e) => setTags(e.value)} 
            placeholder="Type tag and hit Enter"
            className="w-full keywords-chips"
            style={{ width: '100%' }}
          />
        </div>
        {/* 🔹 Category (Dropdown) & Tool Selection (Dropdown) Layout Grid */}
        <div className="editor__box_slug_wrap_grid_half">
          <div className="editor__box_slug_wrap half-width">
          <label className="font-bold block mb-2">Category</label>
            <Dropdown
              value={category}
              options={categoryOptions}
              onChange={(e) => setCategory(e.value)}
              placeholder="Select a Category"
              className="w-full"
              style={{ width: '100%' }}
            />
        </div>
        <div className="editor__box_slug_wrap half-width">
            <label className="font-bold block mb-2">Tool Selection</label>
            <Dropdown
              value={tool}
              options={toolOptions}
              onChange={(e) => setTool(e.value)}
              placeholder="Select a Tool"
              className="w-full"
              style={{ width: '100%' }}
            />
        </div>

        </div>
        

        {/* 🔹 Summary (Rich Text Editor) */}
        <div className="editor__box_content_wrap">
          <label className="font-bold block mb-2">Meta Summary</label>
          <Editor
            value={summary}
            onTextChange={(e) => setSummary(e.htmlValue)}
            style={{ height: "150px" }}
          />
        </div>

        {/* 🔹 Content (Main Rich Text Editor) */}
        <div className="editor__box_content_wrap">
          <label className="font-bold block mb-2">Page Content</label>
          <Editor
            value={content}
            onTextChange={(e) => setContent(e.htmlValue)}
            style={{ height: "300px" }}
          />
        </div>

        <Button
          label={slug ? "Update Page" : "Create Page"}
          icon="pi pi-check"
          className="page__content_submit_btn mt-4"
          onClick={handleSubmit}
          loading={loading}
        />
      </div>
    </div>
  </>
  );
};

export default PageBuilder;