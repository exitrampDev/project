import React, { useEffect, useState } from "react";
import axios from "axios";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { apiBaseUrlState, authState } from "../../../recoil/ctaState";
import DashboardHeader from "./DashboardHeaderBlock";

// PrimeReact
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

const InvitedDataListing = () => {
  const API_BASE = useRecoilValue(apiBaseUrlState);
  const auth = useRecoilValue(authState);
const setAuth = useSetRecoilState(authState);
  const access_token = auth?.access_token || localStorage.getItem("access_token");
const navigate = useNavigate();
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
       if (error.response?.status == 403) {
            console.log("403 Forbidden: Access denied while fetching listings");
                setAuth(null);
                localStorage.removeItem("auth");
                localStorage.removeItem("user");
                localStorage.removeItem("tokenLocalStorage");
                navigate("/login");
          } else {
            
            console.error("Error fetching invites:", error);
          }
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

  const handleAcceptInvite = async (row) => {

  if (!access_token) return;
console.log("Accepting invite with hash:", row.invitationHash);
  try {
    setLoading(true);

    await axios.post(
      `${API_BASE}/invite/accept`,
      { invitationHash:row.invitationHash },
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    // Refresh invites after accepting
    fetchInvites();

  } catch (error) {

     if (err.response?.status == 403) {
            console.log("403 Forbidden: Access denied while fetching listings");
                setAuth(null);
                localStorage.removeItem("auth");
                localStorage.removeItem("user");
                localStorage.removeItem("tokenLocalStorage");
                navigate("/login");
          } else {

            console.error("Error accepting invite:", error);
          }
  } finally {
    setLoading(false);
  }
};


  const handleRejectInvite = async (row) => {

  if (!access_token) return;
console.log("Rejecting invite with hash:", row.invitationHash);
  try {
    setLoading(true);

    await axios.post(
      `${API_BASE}/invite/reject`,
      { invitationHash:row.invitationHash },
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    // Refresh invites after accepting
    fetchInvites();

  } catch (error) {

     if (err.response?.status == 403) {
            console.log("403 Forbidden: Access denied while fetching listings");
                setAuth(null);
                localStorage.removeItem("auth");
                localStorage.removeItem("user");
                localStorage.removeItem("tokenLocalStorage");
                navigate("/login");
          } else {

            console.error("Error accepting invite:", error);
          }
  } finally {
    setLoading(false);
  }
};



const actionTemplate = (row) => {
  const invitedStatus = row.status;
  const accessStatus = row.access;
  const id = row.businessId?._id;

  // PENDING
  if (invitedStatus === "pending") {
    return (
      <div className="view__edit_buttons_action">
        <button
          onClick={() => handleAcceptInvite(row)}
          className="invite__action_btn_accept"
        >
          Accept
        </button>

        <button
          onClick={() => handleRejectInvite(row)}
          className="invite__action_btn_reject"
        >
          Reject
        </button>
      </div>
    );
  }

  // ACCEPTED
if (invitedStatus === "accepted" && accessStatus !== "revoked") {
  const perms = row.accuisitionType || {};

  return (
    <div className="view__edit_buttons_action">
      
      {/* View / Edit */}
      {perms.viewEditBusinessInfo === "yes" && (
        <>
          <a
            href={`/user/single-listing/${id}`}
            className="view__edit_buttons_action_view_btn"
          >
            <i className="pi pi-eye cursor-pointer text-blue-500 hover:text-blue-700"></i>
          </a>

          <a
            href={`/user/edit-listing/${id}`}
            className="view__edit_buttons_action_edit_btn"
          >
            <i className="pi pi-pencil cursor-pointer text-blue-500 hover:text-blue-700"></i>
          </a>
        </>
      )}

      {/* Due Diligence */}
      {perms.dueDeligence === "yes" && (
        <a
          href={`/user/due-diligence/${id}`}
          className="view__edit_buttons_action_view_btn"
        >
          <i className="pi pi-comment cursor-pointer text-blue-500 hover:text-blue-700"></i>
        </a>
      )}

      {/* Document Room */}
      {perms.accessDocumentRoom === "yes" && (
        <a
          href={`/user/document-room/${id}`}
          className="view__edit_buttons_action_view_btn"
        >
          <i className="pi pi-file cursor-pointer text-blue-500 hover:text-blue-700"></i>
        </a>
      )}

    </div>
  );
}
  

  // REJECTED / REVOKED
  if (invitedStatus === "rejected" || invitedStatus === "revoked") {
    return (
      <span className="p-tag p-component p-tag-danger text-capitalize">
      <span className="p-tag-value">
        {invitedStatus} by yourself
      </span>
      </span>
    );
  }

    if ( accessStatus === "revoked") {
    return (
      <span className="p-tag p-component p-tag-danger text-capitalize">
      <span className="p-tag-value">
        {accessStatus} by Inviter
      </span>
      </span>
    );
  }

  // FALLBACK
  return "-";
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
          <Column header="Access" body={(row) => {
            if (row.access === "revoked") {
              return (
                <span className="btn__revoked_invite_text">
                  Access Revoked
                </span>
              );
            }else { 
              return (<span className="text-capitalize">
                  {row?.access }
                </span>
              );
            }
            return null;
          }} />
          <Column header="Actions" body={actionTemplate} />
        </DataTable>
      </div>
    </>
  );
};

export default InvitedDataListing;