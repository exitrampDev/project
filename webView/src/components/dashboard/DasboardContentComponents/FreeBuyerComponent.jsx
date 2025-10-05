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

const FreeBuyerDashboard = () => {
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
    labels: ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6"],
    datasets: [
      {
        label: "NDA Sent",
        backgroundColor: "#42A5F5",
        data: [5, 10, 15, 10, 20, 25],
      },
      {
        label: "Saved",
        backgroundColor: "#66BB6A",
        data: [10, 15, 20, 25, 20, 30],
      },
      {
        label: "Viewed",
        backgroundColor: "#FFA726",
        data: [8, 12, 18, 20, 25, 35],
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
            <h2>Complete Your Buyer Profile</h2>
            <p>
              You're Browsing As a Free Buyer. Save Listings, Submit NDAs, And
              Explore Exit Ramp Deals. To Unlock CIMs And Direct Seller Access,
              Upgrade Anytime.
            </p>
          </div>
          <Button label="Finish Profile" className="p-button-primary" />
        </div>

        {/* Stats divs */}
        <div className="dashboard__free_buyer_count_block">
          <div className="dashboard__free_buyer_count_block_sav_listing">
            <div>
              <h3>Listings Saved</h3>
              <p>04</p>
            </div>
          </div>
          <div className="dashboard__free_buyer_count_block_nda_submit">
            <div>
              <h3>NDAs Submitted</h3>
              <p>3 (2 Pending)</p>
            </div>
          </div>
          <div className="dashboard__free_buyer_count_block_profile_completion">
            <div>
              <h3>Profile Completion</h3>
              <p>40%</p>
            </div>
          </div>
        </div>

        {/* Listings & NDA Pie */}
        <div className="listing__dashboard_data_table_widget_wrap">
          <div className="listing__dashboard_listing_widget">
            <div className="listing__dashboard_listing_widget_header">
              <h3>Your Saved Listings</h3>
              <NavLink to="/user/my-save-listing">View All</NavLink>
            </div>
            <DataTable value={savedListings}>
              <Column field="name" header="Listing Name" />
              <Column field="nda" header="NDA Status" />
              <Column field="access" header="CIM Access" />
            </DataTable>
          </div>
          <div className="listing__dashboard_nda_chart_widget">
            <Chart type="doughnut" data={ndaPieData} />
          </div>
          <div className="listing__dashboard_recentl_data_table">
            <ul>
              <li>Brisbane Cafe For Sale (Seller Listing) - 2 Days Ago</li>
              <li>Logistics Firm - TX (Seller Listing) - 1 Day Ago</li>
              <li>Online Apparel Co. (M&A Listing) - Today</li>
              <li>Brisbane Cafe For Sale (Seller Listing) - 2 Days Ago</li>
            </ul>
          </div>
        </div>

        {/* Recently Viewed */}

        {/* Weekly Activity & NDA Requests */}
        <div className="listing__dashboard_weakly_activity">
          <div className="listing__dashboard_charts">
            <Chart type="bar" data={weeklyData} />
          </div>
          <div className="listing__dashboard_nda_request_data_tables">
            <DataTable value={ndaRequests}>
              <Column field="name" header="Listing Name" />
              <Column field="status" header="Status" />
              <Column field="submitted" header="Submitted On" />
              <Column field="action" header="Actions" />
            </DataTable>
          </div>
        </div>
      </div>
    </>
  );
};

export default FreeBuyerDashboard;
