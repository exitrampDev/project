import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { apiBaseUrlState } from "../../../recoil/ctaState";
import { useRecoilValue } from "recoil";

const PagesList = () => {
  const [pages, setPages] = useState([]);
  const navigate = useNavigate();
  const apiBaseUrl = useRecoilValue(apiBaseUrlState);

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    const res = await axios.get(`${apiBaseUrl}/blog`);
    setPages(res.data);
  };

  const deletePage = async (slug) => {
    if (!window.confirm("Are you sure you want to delete this page?")) return;

    await axios.delete(`${apiBaseUrl}/blog/${slug}`);
    fetchPages();
  };

  // 🔹 Slug Column UI (optional truncate)
  const slugBody = (rowData) => {
    const text = rowData?.pageSlug || "";
    const words = text.split("-");
    return words.length > 4 ? words.slice(0, 4).join("-") + "..." : text;
  };

const formatTitle = (slug) => {
  return slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
};


  // 🔹 Actions Column UI
  const actionBody = (rowData) => {
    return (
      <div className="actionBtnPagesList">
        <Button
          label="Edit"
          size="small"
          onClick={() => navigate(`/admin/insight/${rowData.pageSlug}`)}
        />
        <Button
          label="Delete"
          size="small"
          severity="danger"
          onClick={() => deletePage(rowData.pageSlug)}
        />
      </div>
    );
  };

  return (
    <div className="p-4">
       <div className="dashboard__header_block">

      <h3>All Posts</h3>
    <div className="dashboard__header_search_notification_wrap">
      <Button
        label="Create New Post"
        onClick={() => navigate("/admin/insight/create")}
        className="mb-3"
      />

    </div>
       </div>

      <DataTable value={pages} emptyMessage="No pages found" paginator rows={10} className="my__save_listing_wrap my__listing_table nda__request_block">
        <Column
        header="Page Title"
        body={(rowData) => formatTitle(rowData.pageSlug)}
        sortable
      />
        <Column
          header="Page Slug"
          body={slugBody}
          sortable
        />
        <Column
          header="Actions"
          body={actionBody}
        />
      </DataTable>
    </div>
  );
};

export default PagesList;