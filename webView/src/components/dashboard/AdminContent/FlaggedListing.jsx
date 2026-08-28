import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { authState, apiBaseUrlState } from "../../../recoil/ctaState";
import { useRecoilValue } from "recoil";
import { Toast } from "primereact/toast";
import DashboardHeaderAdmin from "./DaashboardHeaderAdmin";
import ResponsiveDataTable from "../../customcomponent/ResponsiveDataTable";

const FlaggedListing = () => {
  const toast = useRef(null);
  const [flaggedListings, setFlaggedListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const API_BASE = useRecoilValue(apiBaseUrlState);
  const auth = useRecoilValue(authState);

  useEffect(() => {
    const fetchFlaggedListings = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE}/flag`, {
          headers: { Authorization: `Bearer ${auth?.access_token || ""}` },
        });
        const data = res.data.data;
        setFlaggedListings(Array.isArray(data) ? data : data ? [data] : []);
      } catch (err) {
        console.error("❌ Error fetching flagged listings:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFlaggedListings();
  }, [API_BASE, auth]);

  const filteredListings = flaggedListings.filter((item) =>
    item?.users?.[0]?.description?.toLowerCase().includes(search.toLowerCase())
  );

  /* ===========================
     Helpers & Renderers
  ============================ */
  const formatDate = (isoDate) => {
    if (!isoDate) return "-";
    const date = new Date(isoDate);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleBlockListing = async (listingId, statusGet) => {
    if (!listingId) return;
    try {
      await axios.patch(
        `${API_BASE}/business-listing/${listingId}/update-business-status`,
        { status: statusGet },
        {
          headers: {
            Authorization: `Bearer ${auth?.access_token || ""}`,
          },
        }
      );

      // ✅ Update UI state instantly
      setFlaggedListings((prev) =>
        prev.map((item) =>
          item.business?._id === listingId
            ? { ...item, business: { ...item.business, status: statusGet } }
            : item
        )
      );

      toast.current.show({
        severity: "success",
        detail: `Listing has been ${statusGet} successfully.`,
        life: 4000,
      });
    } catch (err) {
      console.error("❌ Error updating listing status:", err);
      alert("Failed to update listing status. Please try again.");
    }
  };

  const actionTemplate = (row) => (
    <>
      {row.business?.status === "block" ? (
        <div
          className="btn__status_update"
          onClick={() => handleBlockListing(row.business?._id, "live")}
        >
          <i className="pi pi-refresh"></i> Mark White Listed
        </div>
      ) : (
        <div
          className="btn__status_update"
          onClick={() => handleBlockListing(row.business?._id, "block")}
        >
          <i className="pi pi-exclamation-triangle"></i> Mark Blacklisted
        </div>
      )}
    </>
  );

  /* ===========================
     Table Columns Configuration
  ============================ */
  const flaggedColumns = [
    {
      field: "businessName",
      header: "Business Name",
      primary: true, // Header title for responsive card view
      body: (row) => row.business?.listingTitle || "-",
    },
    {
      field: "businessOwnerName",
      header: "Business Owner Name",
      body: (row) =>
        row.businessOwner
          ? `${row.businessOwner.first_name || ""} ${row.businessOwner.last_name || ""}`.trim()
          : "-",
    },
    {
      field: "businessOwnerEmail",
      header: "Business Owner Email",
      body: (row) => row.businessOwner?.email || "-",
    },
    {
      field: "firstReportedBy",
      header: "First Reported By",
      body: (row) =>
        row.users?.[0]
          ? `${row.users[0].first_name || ""} ${row.users[0].last_name || ""}`.trim()
          : "-",
    },
    {
      field: "firstReportDescription",
      header: "First Report Description",
      body: (row) => row.users?.[0]?.description || "-",
    },
    {
      field: "flagCount",
      header: "Flag Count",
      sortable: true,
      body: (row) => row.flagCount ?? 0,
    },
    {
      field: "createdAt",
      header: "Created At",
      body: (row) => formatDate(row.business?.createdAt),
    },
    {
      field: "action",
      header: "Action",
      body: actionTemplate,
    },
  ];

  return (
    <>
      <Toast ref={toast} />

      {/* Header */}
      <DashboardHeaderAdmin headingData="Flagged Listing Details" />

      {/* Section Title */}
      <div className="dashboard__free_buyer_complete_profile mb-4">
        <div className="p-d-flex p-jc-between p-ai-center">
          <h2>Flagged Listings Overview</h2>
          <p>All business listings reported by users</p>
        </div>
      </div>

      {/* Table Wrapper */}
      <div className="my__save_listing_wrap my__listing_table">
        <ResponsiveDataTable
          value={filteredListings}
          columns={flaggedColumns}
          loading={loading}
          paginator
          rows={10}
          dataKey={(row) => row.business?._id || row._id}
          emptyMessage="No flagged listings found."
          cardBreakpoint="768px"
        />
      </div>
    </>
  );
};

export default FlaggedListing;