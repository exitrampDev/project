import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { apiBaseUrlState } from "../recoil/ctaState";
import { useRecoilValue } from "recoil";
import Header from "../components/Header";
import Footer from "../components/Footer";

const PageRender = () => {
  const { slug } = useParams();
  const apiBaseUrl = useRecoilValue(apiBaseUrlState);

  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPage = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${apiBaseUrl}/page/${slug}`);
        setPageData(res.data);
      } catch (err) {
        console.error("Error fetching page:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPage();
  }, [slug, apiBaseUrl]);

  // Handle native head DOM modifications
  useEffect(() => {
    if (!pageData) return;

    // 1. Update Title
    document.title = pageData.title || "Default Title";

    // 2. Update Description
    let metaDescription = document.querySelector('meta[name="description"]');
    const cleanSummary = (pageData.summary || "").replace(/<[^>]*>/g, '');
    
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
      
      // Joins the tag array cleanly: "Tag1, Tag2, Tag3"
      metaKeywords.setAttribute("content", pageData.tags.join(", "));
    }

    // Optional Clean up function when component unmounts
    return () => {
      document.title = "My App Default Title";
    };
  }, [pageData]);

  if (loading) return <p>Loading...</p>;

  return (
    <>
      <Header />
      <div className="page__builder_wrapper">
        <div dangerouslySetInnerHTML={{ __html: pageData?.pageContent || "<p>Empty page</p>" }} />
      </div>    
      <Footer />
    </>
  );
};

export default PageRender;