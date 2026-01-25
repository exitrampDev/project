import React, { useEffect, useState,useRef } from "react";
import axios from "axios";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import notifInfo from "../../../assets/notifInfo.png";
import serachIcon from "../../../assets/serachIcon.png";
import userImg from "../../../assets/userImg.png";
import { authState, apiBaseUrlState } from "../../../recoil/ctaState";
import { useRecoilValue } from "recoil";
import { Toast } from "primereact/toast";
import DashboardHeaderAdmin from "./DaashboardHeaderAdmin";


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
      const res = await axios.get(`${API_BASE}/flag`, {
        headers: { Authorization: `Bearer ${auth?.access_token || ""}` },
      });
      const data = res.data.data;
      setFlaggedListings(Array.isArray(data) ? data : [data]);
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

  // ✅ Date formatter
  const formatDate = (isoDate) => {
    if (!isoDate) return "-";
    const date = new Date(isoDate);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

const userName = (user) => {
  if (!user) return "-";
  if (Array.isArray(user) && user.length > 0) {
    return user.map((u, i) => (
      <span key={i}>
        {u.first_name} {u.last_name}
      </span>
    ));
  } else if (typeof user === "object") {
    return `${user.first_name || ""} ${user.last_name || ""}`;
  } else {
    return "-";
  }
};



const handleBlockListing = async (listingId,statusGet) => {
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

    // ✅ Update UI instantly
    setFlaggedListings((prev) =>
      prev.map((item) =>
        item.business._id === listingId
          ? { ...item, business: { ...item.business, status: "block" } }
          : item
      )
    );


    toast.current.show({
      severity: "success",
      detail: `Listing has been ${statusGet} successfully.`,
      life: 4000,
    });
  } catch (err) {
    console.error("❌ Error blocking listing:", err);
    alert("Failed to block listing. Please try again.");
  }
};



const businessListing = (listing) => {
  if (!listing) return "-";
  if (Array.isArray(listing) && listing.length > 0) {
    return listing.map((u, i) => (
      <span key={i}>{u.listingTitle}</span>
    ));
  } else if (typeof listing === "object") {
    return listing.listingTitle || "-";
  } else {
    return "-";
  }
};


  return (
    <>
    <Toast ref={toast} />
      {/* Header */}
   <DashboardHeaderAdmin headingData="Flagged Listing Details"/>
      {/* Section Title */}
      <div className="dashboard__free_buyer_complete_profile mb-4">
        <div className="p-d-flex p-jc-between p-ai-center">
          <h2>Flagged Listings Overview</h2>
          <p>All business listings reported by users</p>
        </div>
      </div>

      {/* Table */}
      <div className="my__save_listing_wrap my__listing_table">
        <DataTable value={filteredListings} paginator rows={10} loading={loading} emptyMessage="No flagged listings found.">
          <Column header="Business Name" body={(row) => row.business?.listingTitle || "-"} />
          <Column header="Business Owner Name" body={(row) => row.businessOwner?.first_name +" "+ row.businessOwner?.last_name || "-"} />
          <Column header="Business Owner Email" body={(row) => row.businessOwner?.email || "-"} />
          <Column header="First Reported By" body={(row) => `${row.users?.[0]?.first_name || ""} ${row.users?.[0]?.last_name || ""}`} />
          <Column header="First Report Description" body={(row) => row.users?.[0]?.description || "-"} />
          <Column field="flagCount" header="Flag Count" sortable />
          <Column header="Created At" body={(row) => formatDate(row.business?.createdAt)} />
          <Column
          header="Action"
          body={(row) => (<>
        {row.business?.status === "block" ? (<>
        <div className="btn__status_update" onClick={() => handleBlockListing(row.business?._id, "live")} >
            <i className="pi pi-refresh"></i> Mark White Listed
            </div>
        </>) : (<>
        <div  className="btn__status_update" onClick={() => handleBlockListing(row.business?._id,"block")} >
            <i className="pi pi-exclamation-triangle"></i> Mark Blacklisted
            </div>
        </>)}
          </>
            
          )}
        />
      </DataTable>
      </div>
    </>
  );
};

export default FlaggedListing;
