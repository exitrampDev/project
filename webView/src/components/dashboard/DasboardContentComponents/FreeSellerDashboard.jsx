import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { Chart } from "primereact/chart";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import "primereact/resources/themes/saga-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import { useRecoilValue } from "recoil";
import { authState } from "../../../recoil/ctaState";

const FreeSellerDashboard = () => {
  const user = useRecoilValue(authState).user;
  const [savedListings] = useState([
    { name: "Cafe Cz, FL", nda: "Submitted", access: "Locked" },
    { name: "Tech Biz CA", nda: "Approved", access: "Locked" },
    { name: "Logistics NY", nda: "Not Started", access: "Locked" },
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
    {
      name: "Tech Biz CA",
      status: "Pending",
      submitted: "May 28, 2025",
      action: "Awaiting Review",
    },
    {
      name: "Logistics NY",
      status: "Approved",
      submitted: "May 28, 2025",
      action: "CM Locked",
    },
  ]);

  const weeklyData = {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
    datasets: [
      {
        label: "NDA Sent",
        backgroundColor: "#42A5F5",
        data: [5, 10, 15, 10],
      },
      {
        label: "Saved",
        backgroundColor: "#66BB6A",
        data: [10, 15, 20, 25],
      },
      {
        label: "Viewed",
        backgroundColor: "#FFA726",
        data: [8, 12, 18, 20],
      },
    ],
  };

  const ndaPieData = {
    labels: ["Approved", "Pending", "Rejected"],
    datasets: [
      {
        data: [5, 2, 1],
        backgroundColor: ["#42A5F5", "#FFA726", "#EF5350"],
        hoverBackgroundColor: ["#64B5F6", "#FFB74D", "#E57373"],
      },
    ],
  };

  return (
    <>
      <div className="dasboard__buyer_header_content">
        <h4>
          👋 Welcome, {user.first_name} {user.last_name}
        </h4>
        <p>
          You're browsing as a Free Buyer. Save listings, submit NDAs, and
          explore Exit Ramp deals. To unlock CIMs and direct seller access,
          upgrade anytime.
        </p>
      </div>
      <div className="dashboard__container_main_buyer_free">
        {/* Header */}
        <div className="dashboard__free_buyer_complete_profile">
          <div className="p-d-flex p-jc-between p-ai-center">
            <h2>Complete Your Seller Profile</h2>
            <p>
              Your Profile Is Incomplete. Buyers Will See Limited Information Until You Provide Key Business and Contact Details.
            </p>
          </div>
          <Button label="Finish Profile" className="p-button-primary" />
        </div>

        {/* Stats divs */}
        <div className="dashboard__free_buyer_count_block">
          <div className="dashboard__free_buyer_count_block_sav_listing">
            <div>
              <h3>Total Listings</h3>
              <p>0 or N</p>
            </div>
          </div>
          <div className="dashboard__free_buyer_count_block_nda_submit">
            <div>
              <h3>NDA Requests</h3>
              <p>3 Pending</p>
            </div>
          </div>
          <div className="dashboard__free_buyer_count_block_profile_completion">
            <div>
              <h3>Active Buyer Views</h3>
              <p>18 this week%</p>
            </div>
          </div>
        </div>

        {/* Listings & NDA Pie */}
        <div className="listing__dashboard_data_table_widget_wrap">
          <div className="listing__dashboard_nda_chart_widget">
            <h3>Listings by Status</h3>
            <Chart type="doughnut" data={ndaPieData} />
          </div>
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
          
          <div className="listing__dashboard_recentl_data_table">
           
              <h3>Your Weekly Listing Activity</h3>
            <Chart type="bar" data={weeklyData} />
  
          </div>
        </div>

        {/* Recently Viewed */}

        {/* Weekly Activity & NDA Requests */}
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

export default FreeSellerDashboard;
