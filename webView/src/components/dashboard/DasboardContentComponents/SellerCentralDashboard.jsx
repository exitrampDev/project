import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { Chart } from "primereact/chart";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { useRecoilValue } from "recoil";
import { authState, apiBaseUrlState } from "../../../recoil/ctaState";
import { ProgressSpinner } from "primereact/progressspinner";

const SellerCentralDasboard = () => {
  const { user, access_token } = useRecoilValue(authState) ?? {};
  const API_BASE = useRecoilValue(apiBaseUrlState);

  const [counts, setCounts] = useState(null);
  const [loading, setLoading] = useState(true);

  const [savedListings] = useState([
    { name: "Cafe Cz, FL", nda: "Submitted", access: "Locked" },
    { name: "Tech Biz CA", nda: "Approved", access: "Locked" },
    { name: "Logistics NY", nda: "Not Started", access: "Locked" },
  ]);

  const [ndaRequests] = useState([
    {
      name: "Cafe Cz, FL",
      status: "Pending",
      submitted: "May 28, 2025",
      action: "CM Locked",
    },
    {
      name: "Tech Biz CA",
      status: "Approved",
      submitted: "May 28, 2025",
      action: "Awaiting Review",
    },
    {
      name: "Logistics NY",
      status: "Rejected",
      submitted: "May 28, 2025",
      action: "Feedback",
    },
  ]);

  // Fetch dashboard counts
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const response = await fetch(`${API_BASE}/business-listing/user-dashboard-counts`, {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        });

        const data = await response.json();
        setCounts(data);
      } catch (error) {
        console.error("Error fetching dashboard counts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();
  }, [API_BASE, access_token]);

  if (loading) {
    return (
      <div className="center_loader">
        <ProgressSpinner />
      </div>
    );
  }

  return (
    <>
      <div className="dasboard__buyer_header_content">
        <h4>
          👋 Welcome, {user?.first_name} {user?.last_name}
        </h4>
        <p>
          You're browsing as a Free Buyer. Save listings, submit NDAs, and explore Exit Ramp deals.
        </p>
      </div>

      <br />

      <div className="dashboard__container_main_buyer_free">

        {/* Count Boxes */}
        <div className="dashboard__free_buyer_count_block">
          <div className="dashboard__free_buyer_count_block_sav_listing">
            <div>
              <h3>Total Listings</h3>
              <p>{counts?.totalBusinesses}</p>
            </div>
          </div>

          <div className="dashboard__free_buyer_count_block_nda_submit">
            <div>
              <h3>Pending NDAs</h3>
              <p>{counts?.pendingNdaSubmiaaions}</p>
            </div>
          </div>

          <div className="dashboard__free_buyer_count_block_profile_completion">
            <div>
              <h3>Live Businesses</h3>
              <p>{counts?.liveBusinesses}</p>
            </div>
          </div>
        </div>

        {/* Doughnut Chart */}
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
                      counts?.liveBusinesses,
                      counts?.pendingBusinesses,
                      counts?.blockedBusinesses,
                    ],
                    backgroundColor: ["#42A5F5", "#FFA726", "#EF5350"],
                  },
                ],
              }}
            />
          </div>

          {/* Saved List Table */}
          <div className="listing__dashboard_listing_widget">
            <div className="listing__dashboard_listing_widget_header">
              <h3>Recently Viewed</h3>
              <NavLink to="/user/my-save-listing">View All</NavLink>
            </div>

            <DataTable value={savedListings}>
              <Column field="name" header="Listing Name" />
              <Column field="nda" header="NDA Status" />
              <Column field="access" header="CIM Access" />
            </DataTable>
          </div>
        </div>

        {/* NDA Requests Table */}
        <div className="listing__dashboard_weakly_activity">
          <div className="listing__dashboard_nda_request_data_tables width__full">
            <h3>Save Listing</h3>
            <DataTable value={ndaRequests}>
              <Column field="name" header="Listing Name" />
              <Column field="status" header="Type" />
              <Column field="submitted" header="Region" />
              <Column field="submitted" header="Industry" />
              <Column field="submitted" header="NDA Status" />
              <Column field="submitted" header="Saved On" />
              <Column field="submitted" header="Last Edited" />
              <Column field="action" header="Actions" />
            </DataTable>
          </div>
        </div>

      </div>
    </>
  );
};

export default SellerCentralDasboard;
