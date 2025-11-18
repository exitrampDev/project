import React, { useEffect, useState } from "react";
import DashboardHeader from "./DashboardHeaderBlock";
import { useParams } from "react-router-dom";
import axios from "axios";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { useRecoilValue } from "recoil";
import { authState, apiBaseUrlState } from "../../../recoil/ctaState";

const UserNotifications = () => {
  const { id } = useParams();
  const API_BASE = useRecoilValue(apiBaseUrlState);
  const auth = useRecoilValue(authState);

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch Notification Data
  const fetchNotifications = async () => {
    try {
      const res = await axios.get(`${API_BASE}/notifications`, {
        headers: {
          Authorization: `Bearer ${auth?.access_token || ""}`,
        },
      });

      const data = res.data;
      console.log("data>>>>>",data._id);
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("❌ Error fetching notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [API_BASE, auth]);

  // Format Dates
  const formatDate = (isoDate) => {
    if (!isoDate) return "-";
    const date = new Date(isoDate);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      <DashboardHeader headingData="Notifications" />

      <div className="my__save_listing_wrap my__listing_table">
        <DataTable
          value={notifications}
          paginator
          rows={10}
          loading={loading}
          emptyMessage="No notifications found."
        >
          <Column field="title" header="Title" sortable />
          <Column field="message" header="Message" />
          <Column field="_id" header="Id" />
          <Column
            header="Status"
            body={(row) =>
              row.isRead ? (
                <span style={{ color: "green", fontWeight: "bold" }}>Read</span>
              ) : (
                <span style={{ color: "red", fontWeight: "bold" }}>Unread</span>
              )
            }
          />

          <Column
            header="Created At"
            body={(row) => formatDate(row.createdAt)}
            sortable
          />
        </DataTable>
      </div>
    </>
  );
};

export default UserNotifications;
