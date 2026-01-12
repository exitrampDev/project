import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import axios from "axios";
import { Chart } from "primereact/chart";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { ProgressSpinner } from "primereact/progressspinner";
import { useRecoilValue } from "recoil";
import { authState, apiBaseUrlState } from "../../../recoil/ctaState";

const SellerCentralDashboard = () => {
  const { user, access_token } = useRecoilValue(authState) ?? {};
  const API_BASE = useRecoilValue(apiBaseUrlState);
const [ndaSubmittedCount, setNdaSubmittedCount] = useState(0);
const [approvedNdaCount, setApprovedNdaCount] = useState(0);
  const [counts, setCounts] = useState(null);
  const [listings, setListings] = useState([]);
  const [saveListing, setSaveListing] = useState([]);
  const [listingSavedCount, setListingSavedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const axiosConfig = {
    headers: {
      Authorization: `Bearer ${access_token}`,
      "Content-Type": "application/json",
    },
  };

  /* ---------------- Fetch Recently Viewed ---------------- */
  useEffect(() => {
    if (!access_token) return;

    const fetchRecentlyViewed = async () => {
      try {
        const { data } = await axios.get(`${API_BASE}/recently`, axiosConfig);

        const mapped = Array.isArray(data?.data)
          ? data.data.map((item) => ({
              ...item.businessId,
              _favId: item._id,
            }))
          : [];

        setListings(mapped);
      } catch (err) {
        setError("Failed to fetch recently viewed listings");
      }
    };

    fetchRecentlyViewed();
     const fetchNdaCount = async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/nda`, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });

      // If API returns array
      if (Array.isArray(data)) {
        setNdaSubmittedCount(data.length);
      }
      // If API returns { total: number }
      else if (typeof data?.total === "number") {
        setNdaSubmittedCount(data.total);
      }


if (Array.isArray(data?.data)) {
      const approvedCount = data.data.filter(
        (nda) => nda.ndaStatus === "approved"
      ).length;

      setApprovedNdaCount(approvedCount);
    }


    } catch (error) {
      console.error("Failed to fetch NDA count", error);
    }
  };

  fetchNdaCount();
  }, [API_BASE, access_token]);

  /* ---------------- Fetch Saved Listings ---------------- */
  useEffect(() => {
    if (!access_token) return;

    const fetchFavorites = async () => {
      try {
        const { data } = await axios.get(`${API_BASE}/favorite`, axiosConfig);

        setListingSavedCount(data?.total ?? 0);

        const mapped = Array.isArray(data?.data)
          ? data.data.map((fav) => ({
              ...fav.businessId,
              _favId: fav._id,
            }))
          : [];

        setSaveListing(mapped);
      } catch (err) {
        setError("Failed to fetch saved listings");
      }
    };

    fetchFavorites();
  }, [API_BASE, access_token]);

  /* ---------------- Fetch Dashboard Counts ---------------- */
  useEffect(() => {
    if (!access_token) return;

    const fetchCounts = async () => {
      try {
        const { data } = await axios.get(
          `${API_BASE}/business-listing/user-dashboard-counts`,
          axiosConfig
        );

        setCounts(data);
      } catch (err) {
        setError("Failed to fetch dashboard counts");
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();
  }, [API_BASE, access_token]);

  /* ---------------- Templates ---------------- */
  const listingNameTemplate = (rowData) => (
    <div className="flex items-center gap-2 img_my_save_lisiting">
      <img
        src={rowData.image || "https://via.placeholder.com/40"}
        alt={rowData.businessName}
        className="w-10 h-10 rounded"
      />
      <span>{rowData.businessName}</span>
    </div>
  );

  const industryTemplate = (row) =>
    row?.industry ? JSON.parse(String(row.industry)) : "—";

  const moneyTemplate = (value) =>
    value ? `$${Number(value).toLocaleString()}` : "—";

  const dateTemplate = (row) =>
    row?.createdAt
      ? new Date(row.createdAt).toLocaleDateString()
      : "—";

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

      <div className="dashboard__container_main_buyer_free">
        {/* ---------- Count Boxes ---------- */}
        <div className="dashboard__free_buyer_count_block">
          <div className="dashboard__free_buyer_count_block_sav_listing">
            <h3>Listings Saved</h3>
            <p>{listingSavedCount}</p>
          </div>

          <div className="dashboard__free_buyer_count_block_nda_submit">
            <h3>NDAs Submitted</h3>
            <p>{ndaSubmittedCount}</p>
          </div>

          <div className="dashboard__free_buyer_count_block_profile_completion">
            <h3>CIMs Accessed</h3>
            <p>{approvedNdaCount}</p>
          </div>
        </div>

        {/* ---------- Chart + Recently Viewed ---------- */}
        <div className="listing__dashboard_data_table_widget_wrap">
          <div className="listing__dashboard_nda_chart_widget">
            <h3>Listings by Status</h3>
            <Chart
              type="doughnut"
              data={{
                labels: ["Live", "Pending", "Blocked"],
                datasets: [
                  {
                    data: [
                      counts?.liveBusinesses ?? 0,
                      counts?.pendingBusinesses ?? 0,
                      counts?.blockedBusinesses ?? 0,
                    ],
                    backgroundColor: ["#42A5F5", "#FFA726", "#EF5350"],
                  },
                ],
              }}
            />
          </div>

          <div className="listing__dashboard_listing_widget lisiting_recent_view_widget">
            <div className="listing__dashboard_listing_widget_header">
              <h3>Recently Viewed</h3>
              <NavLink
                to="/user/recent-view-listing"
                className="view_all"
              >
                View All
              </NavLink>
            </div>

            <DataTable value={listings} emptyMessage="No listings found">
              <Column header="Listing Name" body={listingNameTemplate} />
              <Column header="Business State" field="businessState" />
              <Column header="Cash Flow" field="cashFlow" />
              <Column
                header="Asking Price"
                body={(row) => moneyTemplate(row.askingPrice)}
              />
              <Column header="Created Date" body={dateTemplate} />
            </DataTable>
          </div>
        </div>

        {/* ---------- Saved Listings ---------- */}
        <div className="listing__dashboard_weakly_activity listing__dashboard_save_listing">
          <div className="listing__dashboard_nda_request_data_tables width__full">
            <h3>Saved Listings</h3>

            <DataTable value={saveListing} emptyMessage="No saved listings">
              <Column header="Listing Name" body={listingNameTemplate} />
              <Column header="Industry" body={industryTemplate} />
              <Column header="Business State" field="businessState" />
              <Column header="Cash Flow" field="cashFlow" />
              <Column
                header="Asking Price"
                body={(row) => moneyTemplate(row.askingPrice)}
              />
              <Column header="Created Date" body={dateTemplate} />
            </DataTable>
          </div>
        </div>

        {error && <p className="error_text">{error}</p>}
      </div>
    </>
  );
};

export default SellerCentralDashboard;
