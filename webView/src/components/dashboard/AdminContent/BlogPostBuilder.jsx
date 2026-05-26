import React, { useEffect, useState } from "react";
import { Editor } from "primereact/editor";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { Chips } from "primereact/chips";
import axios from "axios";
import { useParams } from "react-router-dom";
import { apiBaseUrlState } from "../../../recoil/ctaState";
import { useRecoilValue } from "recoil";
import FileUploader from "../../customcomponent/FileUploader";

const PageBuilder = () => {
  const { slug } = useParams();
  const apiBaseUrl = useRecoilValue(apiBaseUrlState);

  // Existing Fields
  const [pageTitle, setPageTitle] = useState("");
  const [pageSlug, setPageSlug] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  // Payload Updated Fields
  const [category, setCategory] = useState(null);
  const [tags, setTags] = useState([]);
  const [summary, setSummary] = useState("");
  const [tool, setTool] = useState(null);
  
  // New schema fields
  const [author, setAuthor] = useState("");
  const [thumbnail, setThumbnail] = useState(""); 

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

  // 🔹 Slug generator
  const generateSlug = (text) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "") 
      .replace(/\s+/g, "-") 
      .replace(/-+/g, "-"); 
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
      const res = await axios.get(`${apiBaseUrl}/blog/${slug}`);
      const data = res.data;

      setPageSlug(data.pageSlug);
      setContent(data.pageContent);
      setPageTitle(data.title || ""); 
      
      setCategory(data.categories && data.categories.length > 0 ? data.categories[0] : null);
      setTags(data.tags || []);
      setSummary(data.summary || "");
      setTool(data.tool || null);
      setAuthor(data.author || "");
      setThumbnail(data.thumbnail || ""); // Preloads existing base64 string or url string

    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Convert chosen File object to Base64 payload string
  const handleImageSelect = (file) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnail(reader.result); // sets state to data:image/png;base64,...
      };
      reader.readAsDataURL(file);
    } else {
      setThumbnail(""); // Reset if file cleared
    }
  };

  // 🔹 Handle title change → auto slug
  const handleTitleChange = (value) => {
    setPageTitle(value);
    if (!slug) {
      setPageSlug(generateSlug(value));
    }
  };

  // 🔹 Submit
  const handleSubmit = async () => {
    if (!pageTitle || !content) {
      alert("Title and content required");
      return;
    }

    try {
      const payload = {
        pageSlug: pageSlug,
        pageContent: content,
        title: pageTitle,
        categories: category ? [category] : [], 
        tags: tags,
        summary: summary,
        tool: tool,
        author: author,
        thumbnail: thumbnail // Sent exactly as your raw base64 data payload string
      };

      if (slug) {
        await axios.put(`${apiBaseUrl}/blog/${slug}`, payload);
        alert("Page updated successfully");
      } else {
        await axios.post(`${apiBaseUrl}/blog`, payload);
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
        <a href={window.location.origin + `/insight/${pageSlug}`} target="_blank" rel="noopener noreferrer" className="viewPageLink">
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
          <label className="font-bold block mb-2">Post Slug</label>
          <p><span>{window.location.origin}/insight/</span>{pageSlug}</p>
        </div>

        {/* 🔹 Author Block */}
        <div className="editor__box_slug_wrap">
          <label className="font-bold block mb-2">Author Name</label>
          <InputText
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Enter author name"
            className="w-full"
          />
        </div>

        {/* 🔹 Your Custom FileUploader Component */}
        <div className="editor__box_slug_wrap">
          <label className="font-bold block mb-2">Thumbnail Image</label>
          <FileUploader
            accept="image/png, image/jpeg,.pdf"
            maxSizeMB={5}
            existingFileUrl={thumbnail || "dss"} // Passes the fetched base64 string or placeholder string 
            onFileSelect={(file) => handleImageSelect(file)}
          />
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

        {/* 🔹 Category & Tool Selection Layout Grid */}
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
  );
};

export default PageBuilder;