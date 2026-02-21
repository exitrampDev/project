import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { Chart } from "primereact/chart";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { ProgressSpinner } from "primereact/progressspinner";
import { useRecoilValue } from "recoil";
import { authState, apiBaseUrlState } from "../../../recoil/ctaState";
import axios from "axios";

const SellerCentralDashboard = () => {
  const { user, access_token } = useRecoilValue(authState) ?? {};
  const API_BASE = useRecoilValue(apiBaseUrlState);
const [pendingNdaCount, setPendingNdaCount] = useState(0);
  const [counts, setCounts] = useState(null);
  const [listings, setListings] = useState([]);
   const [saveListing, setSaveListing] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* ---------------- Fetch Recently Viewed ---------------- */
useEffect(() => {
  const fetchSavedListings = async () => {
    try {
      const res = await fetch(
        `${API_BASE}/business-listing/public?page=1`,
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) throw new Error("Failed to fetch saved listings");

      const result = await res.json();

      setSaveListing(Array.isArray(result?.data) ? result.data : []);
    } catch (err) {
      console.error("Saved listings error:", err);
      setSaveListing([]);
    }
  };

  if (access_token) fetchSavedListings();
}, [API_BASE, access_token]);

const listingNameTemplate = (rowData) => {
  const title = rowData?.listingTitle || "";
  const words = title.split(" ");
  const truncatedTitle =
    words.length > 7 ? words.slice(0, 7).join(" ") + "..." : title;

  return (
    <div className="flex items-center gap-2 img_my_save_lisiting">
      <img
        src={rowData.image || "https://via.placeholder.com/40"}
        alt={title}
        className="w-10 h-10 rounded"
      />
      <span>{truncatedTitle}</span>
    </div>
  );
};

const industryTemplate = (rowData) => {
  if (!rowData?.industry) return "—";

  try {
    const parsed = JSON.parse(rowData.industry);
    return Array.isArray(parsed) ? parsed.join(", ") : "—";
  } catch {
    return "—";
  }
};
  const ndaStatusTemplate = () => "Pending";
  const moneyTemplate = (value) =>
  value || value === 0 ? `$ ${Number(value).toLocaleString()}` : "—";

const saveIndustryTemplate = (indusValue) => (JSON.parse(Object(indusValue?.industry)));

  /* ---------------- Fetch Dashboard Counts ---------------- */
  useEffect(() => {
    if (!access_token) return;

    const fetchCounts = async () => {
      try {
        const response = await fetch(
          `${API_BASE}/admin/dashboard-counts`,
          {
            headers: {
              Authorization: `Bearer ${access_token}`,
            },
          }
        );

        const data = await response.json();
        setCounts(data);
      } catch (err) {
        console.error("Error fetching dashboard counts:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();
  }, [API_BASE, access_token]);



  /* ---------------- Loader ---------------- */
  if (loading) {
    return (
      <div className="center_loader">
        <ProgressSpinner />
      </div>
    );
  }

  /* ---------------- UI ---------------- */
  return (
    <>
      <div className="dasboard__buyer_header_content">
        <h4>
          👋 Welcome, {user?.first_name} {user?.last_name}
        </h4>
        <p>
          You're browsing as a Free Buyer. Save listings, submit NDAs, and explore
          Exit Ramp deals.
        </p>
      </div>

      <br />

      <div className="dashboard__container_main_buyer_free admin__dashboard_main_container">
        {/* ---------- Count Boxes ---------- */}
        <div className="dashboard__free_buyer_count_block">
             <div className="dashboard__free_buyer_count_block_nda_submit">
            <h3>Total Sellers</h3>
            <p>{counts?.sellers ?? 0}</p>
          </div>

          <div className="dashboard__free_buyer_count_block_profile_completion">
            <h3>Total Brokers</h3>
            <p>{counts?.brokers ?? 0}</p>
          </div>
          <div className="dashboard__free_buyer_count_block_profile_completion">
            <h3>Total Buyers</h3>
            <p>{counts?.buyers ?? 0}</p>
          </div>
          <div className="dashboard__free_buyer_count_block_sav_listing uesr__data_quarterly_activity">
            <h3>Total Users</h3>
            <p>{counts?.users ?? 0}</p>
          </div>
 <div className="dashboard__free_buyer_count_block_profile_completion uesr__data_quarterly_activity">
            <h3>Total Businesses</h3>
            <p>{counts?.businesses ?? 0}</p>
          </div>
          <div className="dashboard__free_buyer_count_block_profile_completion  uesr__data_quarterly_activity">
            <h3>Total NDAs</h3>
            <p>{counts?.ndas ?? 0}</p>
          </div>
          <div className="dashboard__free_buyer_count_block_profile_completion uesr__data_quarterly_activity">
            <h3>Total Live Businesses</h3>
            <p>{counts?.businessLiveCount ?? 0}</p>
          </div>
       
         
        </div>

     
        {/* ---------- Saved Listings Table ---------- */}
        <div className="listing__dashboard_weakly_activity listing__dashboard_save_listing">
          <div className="listing__dashboard_nda_request_data_tables width__full">
            <h3>User Listings</h3>

          <DataTable
  value={saveListing}
  emptyMessage="No saved listings found"
>
  <Column header="Listing Name" body={listingNameTemplate} />
    <Column header="Owner Name" body={(rowData) => (<>
    {rowData.ownerId?.first_name} {rowData.ownerId?.last_name}
  </>)} />
  <Column header="Industry" body={industryTemplate} />
  <Column
    header="Business State"
    body={(rowData) => rowData.businessState ?? "—"}
  />
  <Column
    header="Cash Flow"
    body={(rowData) => moneyTemplate(rowData.cashFlow)}
  />
  <Column
    header="Asking Price"
    body={(rowData) => moneyTemplate(rowData.askingPrice)}
  />
  <Column
    header="Created Date"
    body={(rowData) =>
      rowData.createdAt
        ? new Date(rowData.createdAt).toLocaleDateString()
        : "—"
    }
  />
</DataTable>

          </div>
        </div>

        {error && <p className="error_text">{error}</p>}
      </div>
    </>
  );
};

export default SellerCentralDashboard;
