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
    if (!access_token) return;

    const fetchRecentlyViewed = async () => {
      try {
        const response = await fetch(`${API_BASE}/recently`, {
          headers: {
            Authorization: `Bearer ${access_token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch recently viewed listings");
        }

        const result = await response.json();

        const mappedListings = Array.isArray(result?.data)
          ? result.data.map((item) => ({
              ...item.businessId,
              _favId: item._id,
            }))
          : [];

        setListings(mappedListings);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchRecentlyViewed();


  const fetchFavorites = async () => {
      try {
        const response = await fetch(`${API_BASE}/favorite`, {
          headers: {
            Authorization: `Bearer ${access_token}`,
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) throw new Error("Failed to fetch favorites");
        const result = await response.json();
        if (result && Array.isArray(result.data)) {
          const mapped = result.data.map((fav) => ({
            ...fav.businessId,
            _favId: fav._id,
          }));
       setSaveListing(mapped);
       console.log("saveListing>>>>>>",saveListing);
      }else{
        setSaveListing([])
      }

      } catch (err) {
      }
    };
    if (access_token) fetchFavorites();

 const fetchNdaList = async () => {
      try {
        const { data } = await axios.get(`${API_BASE}/nda/owner-submissions`, {
          headers: {
            Authorization: `Bearer ${access_token}`,
            "Content-Type": "application/json",
          },
        });

        if (Array.isArray(data?.data)) {
      const pendingCount = data.data.filter(
        (nda) => nda.ndaStatus === "pending"
      ).length;

      setPendingNdaCount(pendingCount);
    }

      } catch (error) {
        console.error("Error fetching NDA list:", error);
      } finally {
        setLoading(false);
      }
    };fetchNdaList();
    
  }, [API_BASE, access_token]);
 const listingNameTemplate = (rowData) => (
    <div className="flex items-center gap-2 img_my_save_lisiting">
      <img
        src={rowData.image || "https://via.placeholder.com/40"}
        alt={rowData.listingTitle}
        className="w-10 h-10 rounded"
      />
      <span>{rowData.listingTitle}</span>
    </div>
  );
const industryTemplate = (indusValue) => {
  const industry = indusValue?.industry;

  if (!industry) return null;

  try {
    return JSON.parse(industry);
  } catch (e) {
    console.error('Invalid industry JSON:', industry);
    return null;
  }
}
  const ndaStatusTemplate = () => "Pending";
  const moneyTemplate = (value) => value ? `$ ${Number(value).toLocaleString()??''}` : "—";
const saveIndustryTemplate = (indusValue) => (JSON.parse(Object(indusValue?.industry)));

  /* ---------------- Fetch Dashboard Counts ---------------- */
  useEffect(() => {
    if (!access_token) return;

    const fetchCounts = async () => {
      try {
        const response = await fetch(
          `${API_BASE}/business-listing/user-dashboard-counts`,
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

      <div className="dashboard__container_main_buyer_free">
        {/* ---------- Count Boxes ---------- */}
        <div className="dashboard__free_buyer_count_block">
          <div className="dashboard__free_buyer_count_block_sav_listing">
            <h3>Total Listings</h3>
            <p>{counts?.totalBusinesses ?? 0}</p>
          </div>

          <div className="dashboard__free_buyer_count_block_nda_submit">
            <h3>Pending NDAs</h3>
            <p>{pendingNdaCount}</p>
          </div>

          <div className="dashboard__free_buyer_count_block_profile_completion">
            <h3>Live Businesses</h3>
            <p>{counts?.liveBusinesses ?? 0}</p>
          </div>
        </div>

        {/* ---------- Chart + Table ---------- */}
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
              <NavLink to="/user/recent-view-listing" className="view_all">View All</NavLink>
            </div>

            <DataTable value={listings} emptyMessage="No listings found" className="lisiting_recent_view_table">
                        <Column header="Listing Name" body={listingNameTemplate} />
                       <Column  header="Business State" body={(listingData) => { return listingData.businessState;}}/>
                        <Column header="Cash Flow" body={(listingData) => { return listingData.cashFlow}} />
                        <Column header="Asking Price"  body={(rowData) => moneyTemplate(rowData.askingPrice)} />
                        <Column body={(listingData)=>{return new Date(listingData.createdAt).toLocaleDateString()}} header="Created Date" />
            </DataTable>
          </div>
        </div>

        {/* ---------- Saved Listings Table ---------- */}
        <div className="listing__dashboard_weakly_activity listing__dashboard_save_listing">
          <div className="listing__dashboard_nda_request_data_tables width__full">
            <h3>Saved Listings</h3>

          <DataTable value={saveListing}>
                        <Column header="Listing Name" body={listingNameTemplate} />
                        <Column header="Industry" body={industryTemplate} />
                       <Column  header="Business State" body={(listingData) => { return listingData.businessState;}}/>
                        <Column header="Cash Flow" body={(listingData) => { return listingData.cashFlow}} />
                        <Column header="Asking Price"  body={(rowData) => moneyTemplate(rowData.askingPrice)} />
                        <Column body={(listingData)=>{return new Date(listingData.createdAt).toLocaleDateString()}} header="Created Date" />
            </DataTable>
          </div>
        </div>

        {error && <p className="error_text">{error}</p>}
      </div>
    </>
  );
};

export default SellerCentralDashboard;
