// src/components/PageRender.jsx
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

  const [pageContent, setPageContent] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPage = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${apiBaseUrl}/page/${slug}`);
        setPageContent(res.data.pageContent || "<p>Empty page</p>");
      } catch (err) {
        console.error("Error fetching page:", err);
        setPageContent("<p>Page not found</p>");
      } finally {
        setLoading(false);
      }
    };

    fetchPage();
  }, [slug, apiBaseUrl]);

  if (loading) return <p>Loading...</p>;

  return (
    <>
     <Header />
     <div className="page__builder_wrapper">
            <div dangerouslySetInnerHTML={{ __html: pageContent }} />
    
    </div>    
    <Footer />
    </>
    
  );
};

export default PageRender;