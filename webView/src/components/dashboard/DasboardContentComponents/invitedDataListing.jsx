import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRecoilValue } from "recoil";
import { apiBaseUrlState, authState } from "../../../recoil/ctaState";
import DashboardHeader from "./DashboardHeaderBlock";

// PrimeReact
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

const InvitedDataListing = () => {
  const API_BASE = useRecoilValue(apiBaseUrlState);
  const auth = useRecoilValue(authState);

  const access_token = auth?.access_token || localStorage.getItem("access_token");

  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchInvites = async () => {
    if (!access_token) return;

    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/invite/received`, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });

      // handle different API response shapes
      setInvites(res.data?.data || res.data || []);
    } catch (error) {
      console.error("Error fetching invites:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvites();
  }, []);

  // ========================
  // Column Templates
  // ========================

  const invitedByTemplate = (row) =>
    row.invitedByUserId?.email || "-";

const permissionsTemplate = (row) => {
  const perms = row.accuisitionType || {};

  const entries = Object.entries(perms);

  if (!entries.length) return "-";

  return (
    <div className="permissions__badges_wrap">
      {entries.map(([key, value]) => (
        <span
          key={key}
          className="permissions__badges_wrap_badge"
        >
          <i>{key}:</i> <em>{value}   </em>
        </span>
      ))}
    </div>
  );
};

  const statusTemplate = (row) => {
    let statusColor = "bg-gray-500";

    if (row.status === "pending") statusColor = "bg-yellow-500";
    else if (row.status === "accepted") statusColor = "bg-green-600";
    else if (row.status === "rejected") statusColor = "bg-red-500";

    return (
      <span className={`px-2 py-1 rounded text-white text-sm ${statusColor}`}>
        {row.status || "-"}
      </span>
    );
  };

  const dateTemplate = (row) => {
    if (!row.createdAt) return "-";
    return new Date(row.createdAt).toLocaleDateString();
  };
const actionTemplate = (row) => {
  const id = row.businessId._id; // adjust if needed

  return (
    <div className="view__edit_buttons_action">
      {/* View Button */}
      <a
        href={`/user/single-listing/${id}`}
        className="view__edit_buttons_action_view_btn"
      >
        <i
        className="pi pi-eye cursor-pointer text-blue-500 hover:text-blue-700"
      ></i> 
      </a>

      
      <a
        href={`/user/edit-listing/${id}`}
        className="view__edit_buttons_action_edit_btn"
      >
         <i
        className="pi pi-pencil cursor-pointer text-blue-500 hover:text-blue-700"
      ></i>
      </a>
    </div>
  );
};
  return (
    <>
      <DashboardHeader headingData="My Invited Listings" />

      <div className="p-4">
        <DataTable
          value={invites}
          loading={loading}
          paginator
          rows={5}
          responsiveLayout="scroll"
          emptyMessage="No invitations found"
          className="my__save_listing_wrap my__payment_history_table"
        >
          <Column header="Name" body={(row) => row.businessId?.listingTitle || "-"}  className="invited__list_title "/>
          <Column field="invitedEmail" header="Email"  />
          <Column field="role" header="Role"  />

          <Column
            field="invitedByUserId.email"
            header="Invited By"
            body={invitedByTemplate}
          />

          <Column
            header="Permissions"
            body={permissionsTemplate}
          />

          <Column
            field="status"
            header="Status"
            body={statusTemplate}
            
          />

          <Column
            field="createdAt"
            header="Created At"
            body={dateTemplate}
            
          />
          <Column header="Actions" body={actionTemplate} />
        </DataTable>
      </div>
    </>
  );
};

export default InvitedDataListing;