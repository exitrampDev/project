import React, { useEffect, useRef, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { apiBaseUrlState, authState } from "../../../recoil/ctaState";
import axios from "axios";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";

import DashboardHeader from "./DashboardHeaderBlock";

const DocumentRoom = () => {
  const { id } = useParams();
  const API_BASE = useRecoilValue(apiBaseUrlState);
  const { user, access_token } = useRecoilValue(authState) ?? {};

  const toast = useRef(null);

  const [files, setFiles] = useState([]);
  const [listingData, setListingData] = useState({});
  const [submissions, setSubmissions] = useState([]);

  const [refreshKey, setRefreshKey] = useState(0);

  // Filters
  const [searchText, setSearchText] = useState("");
  const [category, setCategory] = useState(null);
  const [uploadedOn, setUploadedOn] = useState(null);
  const [size, setSize] = useState(null);

  // Upload fields
  const [displayName, setDisplayName] = useState("");
  const [typeName, setTypeName] = useState(null);

  const categoryOptions = [
    { label: "PDF", value: "pdf" },
    { label: "JPG", value: "jpg" },
    { label: "PNG", value: "png" },
  ];

  const uploadedOnOptions = [
    { label: "Newest First", value: "newest" },
    { label: "Oldest First", value: "oldest" },
  ];

  const sizeOptions = [
    { label: "Small (<1MB)", value: "small" },
    { label: "Medium (1MB-5MB)", value: "medium" },
    { label: "Large (>5MB)", value: "large" },
  ];

  // -------------------------------------------------------------------
  // FETCH DATA
  // -------------------------------------------------------------------

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const res = await axios.get(`${API_BASE}/files/${id}`);
        setFiles(res.data || []);
      } catch (err) {
        console.error("Error fetching files:", err);
      }
    };

    const fetchListing = async () => {
      try {
        const res = await axios.get(`${API_BASE}/business-listing/${id}`);
        setListingData(res?.data || {});
      } catch (err) {
        console.error("Listing fetch error:", err);
      }
    };

    const fetchSubmissions = async () => {
      if (!access_token) return;
      try {
        const res = await axios.get(`${API_BASE}/nda/owner-submissions`, {
          headers: { Authorization: `Bearer ${access_token}` },
        });
        setSubmissions(res?.data?.data || []);
      } catch (err) {
        console.error("Submissions fetch error:", err);
      }
    };

    fetchFiles();
    fetchListing();
    fetchSubmissions();
  }, [id, API_BASE, access_token, refreshKey]);

  // -------------------------------------------------------------------
  // DELETE FILE
  // -------------------------------------------------------------------

  const deleteFile = async (fileId) => {
    try {
      const res = await axios.delete(`${API_BASE}/files/${fileId}`);

      toast.current.show({
        severity: "success",
        summary: "File Deleted",
        detail: res.data.message,
      });

      setFiles((prev) => prev.filter((f) => f._id !== fileId));
    } catch (err) {
      toast.current.show({
        severity: "error",
        summary: "Delete Failed",
        detail: "Unable to delete file.",
      });
    }
  };

  // -------------------------------------------------------------------
  // UPLOAD FILE
  // -------------------------------------------------------------------

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("displayName", displayName || file.name);
    formData.append("typeName", typeName || file.name.split(".").pop());

    try {
      const res = await axios.post(`${API_BASE}/files/${id}/upload`, formData, {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      toast.current.show({
        severity: "success",
        summary: "Upload Successful",
        detail: res?.data?.message || "File uploaded",
      });

      setDisplayName("");
      setTypeName(null);
      setRefreshKey((p) => p + 1);
    } catch (err) {
      toast.current.show({
        severity: "error",
        summary: "Upload Failed",
        detail: "Unable to upload file.",
      });
    }
  };

  // -------------------------------------------------------------------
  // FILE ACCESS CONTROL (GRANT / REVOKE)
  // -------------------------------------------------------------------

  const updateDocAccess = async (ndaId, isApproved) => {
    try {
      const endpoint = isApproved
        ? "/nda/disallow-doc-room"
        : "/nda/allow-doc-room";

      const res = await axios.patch(
        `${API_BASE}${endpoint}`,
        { ndaId },
        { headers: { Authorization: `Bearer ${access_token}` } }
      );

      toast.current.show({
        severity: "success",
        summary: "Access Updated",
        detail: res.data.message,
      });

      setRefreshKey((p) => p + 1);
    } catch (err) {
      toast.current.show({
        severity: "error",
        summary: "Failed",
        detail: "Unable to update access.",
      });
    }
  };

  // -------------------------------------------------------------------
  // FILTERING FILES
  // -------------------------------------------------------------------

  const filteredFiles = useMemo(() => {
    return files
      .filter(
        (f) =>
          f.typeName !== "cim_file" &&
          !["listingImage1", "listingImage2", "listingImage3", "listingImage4", "listingImage5"].includes(f.displayName)
      )
      .filter((f) =>
        f.displayName.toLowerCase().includes(searchText.toLowerCase())
      )
      .filter((f) => (category ? f.typeName === category : true))
      .filter((f) => {
        if (!size) return true;
        const fileMB = f.size / (1024 * 1024);

        if (size === "small") return fileMB < 1;
        if (size === "medium") return fileMB >= 1 && fileMB <= 5;
        if (size === "large") return fileMB > 5;

        return true;
      })
      .sort((a, b) => {
        if (uploadedOn === "newest")
          return new Date(b.createdAt) - new Date(a.createdAt);
        if (uploadedOn === "oldest")
          return new Date(a.createdAt) - new Date(b.createdAt);
        return 0;
      });
  }, [files, searchText, category, uploadedOn, size]);

  // -------------------------------------------------------------------
  // TABLE RENDERERS
  // -------------------------------------------------------------------

  const renderActions = (row) => (
    <div className="renderActionDocRoomList">
      <a
        href={`${API_BASE}${row.url}`}
        target="_blank"
        rel="noopener noreferrer"
        className="renderActionDocRoomList__anchor"
      >
        Preview
      </a>
      <div onClick={() => deleteFile(row._id)} className="renderActionDocRoomList_dlt_btn">
        Delete
      </div>
    </div>
  );

  const ndaStatusUI = (status) =>
    status === "approved" ? (
      <span className="File_access_cim_sharing_approve">
        <i className="pi pi-check text-green-500"></i> Approved
      </span>
    ) : (
      <span className="File_access_cim_sharing_reject">
        <i className="pi pi-times text-red-500"></i> Not Approved
      </span>
    );

  return (
    <div className="dashboard__header">
      <Toast ref={toast} />

      <DashboardHeader headingData={`Document Room | ${listingData.businessName}`} />

      <div className="brief__infor_content">
        <p>
          Securely Manage And Share Files With Buyers Who Have Been Approved To Access Your CIM.
        </p>
      </div>

      {/* FILTER BAR */}
      <div className="filterBar__mian_list_wrap">
        <div className="filterBar__mian_list_filter_col">
          <span className="filterBar__mian_list_search">
            <i className="pi pi-search"></i>
            <InputText
              placeholder="Search by Name"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </span>

          <Dropdown value={category} options={categoryOptions} onChange={(e) => setCategory(e.value)} placeholder="Category" />
          <Dropdown value={uploadedOn} options={uploadedOnOptions} onChange={(e) => setUploadedOn(e.value)} placeholder="Uploaded On" />
          <Dropdown value={size} options={sizeOptions} onChange={(e) => setSize(e.value)} placeholder="Size" />
        </div>

        <label className="p-button p-component cursor-pointer filterBar__mian_list_file_upload_content">
          <i className="pi pi-file mr-2"></i> Upload File
          <span>(PDF/JPEG/PNG)</span>
          <input type="file" hidden onChange={handleFileUpload} />
        </label>
      </div>

      {/* FILE LIST */}
      <div className="my__save_listing_wrap my__listing_table docRoom_data_table">
        <DataTable value={filteredFiles} emptyMessage="No files found.">
          <Column field="displayName" header="File Name" />
          <Column header="Listing" body={() => listingData.businessName} />
          <Column header="Category" body={(row) => row.typeName.toUpperCase()} />
          <Column
            header="Uploaded On"
            body={(row) =>
              new Date(row.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            }
          />
          <Column header="Size" body={(row) => `${(row.size / 1024).toFixed(1)} KB`} />
          <Column header="Actions" body={renderActions} />
        </DataTable>
      </div>

      {/* ACCESS CONTROL */}
      <div className="docRoom_data_table_access_files_wrap">
        <h3 className="docRoom_data_table_access_files_title">File Access Control</h3>

        <div className="my__save_listing_wrap my__listing_table docRoom_data_table">
          <DataTable value={submissions} emptyMessage="No data">
            <Column field="businessName" header="Listing Name" />
            <Column field="buyerName" header="Buyer Name" />
            <Column header="NDA Status" body={() => ndaStatusUI("approved")} />
            <Column header="CIM Shared" body={(row) => ndaStatusUI(row.ndaStatus)} />
            <Column header="Doc Room Access" body={(row) => ndaStatusUI(row.docRoomAccess)} />
            <Column
              header="Action"
              body={(row) => (
                <Button
                  label={row.docRoomAccess === "approved" ? "Revoke Access" : "Grant Access"}
                  onClick={() => updateDocAccess(row._id, row.docRoomAccess === "approved")}
                />
              )}
            />
          </DataTable>
        </div>
      </div>
    </div>
  );
};

export default DocumentRoom;
