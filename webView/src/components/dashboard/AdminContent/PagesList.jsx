import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";
import { apiBaseUrlState } from "../../../recoil/ctaState";
import { useRecoilValue } from "recoil";
import ResponsiveDataTable from "../../customcomponent/ResponsiveDataTable";

const PagesList = () => {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const apiBaseUrl = useRecoilValue(apiBaseUrlState);

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${apiBaseUrl}/page`);
      setPages(res.data || []);
    } catch (error) {
      console.error("Error loading pages:", error);
    } finally {
      setLoading(false);
    }
  };

  const deletePage = async (slug) => {
    if (!window.confirm("Are you sure you want to delete this page?")) return;

    try {
      await axios.delete(`${apiBaseUrl}/page/${slug}`);
      fetchPages();
    } catch (error) {
      console.error("Error deleting page:", error);
    }
  };

  /* ===========================
     Helpers
  ============================ */
  const formatTitle = (slug) => {
    if (!slug) return "-";
    return slug
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const slugBody = (rowData) => {
    const text = rowData?.pageSlug || "";
    const words = text.split("-");
    return words.length > 4 ? `${words.slice(0, 4).join("-")}...` : text;
  };

  /* ===========================
     Actions Body
  ============================ */
  const actionBody = (rowData) => (
    <div className="actionBtnPagesList">
      <Button
        label="Edit"
        size="small"
        onClick={() => navigate(`/admin/pages/${rowData.pageSlug}`)}
      />
      <Button
        label="Delete"
        size="small"
        severity="danger"
        onClick={() => deletePage(rowData.pageSlug)}
      />
    </div>
  );

  /* ===========================
     Table Columns Configuration
  ============================ */
  const pageColumns = [
    {
      field: "pageTitle",
      header: "Page Title",
      primary: true, // Key property for responsive card view headers
      sortable: true,
      body: (rowData) => formatTitle(rowData.pageSlug),
    },
    {
      field: "pageSlug",
      header: "Page Slug",
      sortable: true,
      body: slugBody,
    },
    {
      field: "actions",
      header: "Actions",
      body: actionBody,
    },
  ];

  return (
    <div className="p-4">
      <div className="dashboard__header_block">
        <h3>All Pages</h3>
        <div className="dashboard__header_search_notification_wrap">
          <Button
            label="Create New Page"
            onClick={() => navigate("/admin/pages/create")}
            className="mb-3"
          />
        </div>
      </div>

      <div className="my__save_listing_wrap my__listing_table nda__request_block">
        <ResponsiveDataTable
          value={pages}
          columns={pageColumns}
          loading={loading}
          paginator
          rows={10}
          dataKey="pageSlug"
          emptyMessage="No pages found."
          cardBreakpoint="768px"
        />
      </div>
    </div>
  );
};

export default PagesList;