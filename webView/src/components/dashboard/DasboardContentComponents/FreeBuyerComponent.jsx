import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import axios from "axios";
import { Chart } from "primereact/chart";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { ProgressSpinner } from "primereact/progressspinner";
import { useRecoilValue } from "recoil";
import { Link } from "react-router-dom";
import { Tag } from "primereact/tag";
import { authState, apiBaseUrlState } from "../../../recoil/ctaState";

const SellerCentralDashboard = () => {
  const { user, access_token } = useRecoilValue(authState) ?? {};
  const API_BASE = useRecoilValue(apiBaseUrlState);
const [ndaSubmittedCount, setNdaSubmittedCount] = useState(0);
const [ndaData, setNdaData] = useState([]);
const [approvedNdaCount, setApprovedNdaCount] = useState(0);
  const [counts, setCounts] = useState(null);
  const [listings, setListings] = useState([]);
  const [saveListing, setSaveListing] = useState([]);
  const [listingSavedCount, setListingSavedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ndaList, setNdaList] = useState([]);

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

      if (Array.isArray(data?.data)) {
        setNdaData(data.data);
        console.log("NDA Data:", ndaData);
      }
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

    
  const fetchNdaList = async () => {
      try {
        const { data } = await axios.get(`${API_BASE}/nda`, {
          headers: {
            Authorization: `Bearer ${access_token}`,
            "Content-Type": "application/json",
          },
        });

        // Ensure data is an array
        setNdaList(data.data);

        console.log("NDA List:", ndaList);
      } catch (error) {
        console.error("Error fetching NDA list:", error);
      } finally {
        setLoading(false);
      }
    };
fetchNdaList();
    fetchCounts();
  }, [API_BASE, access_token]);



  /* ---------------- Templates ---------------- */
  // const listingNameTemplate = (rowData) => (
  //   <div className="flex items-center gap-2 img_my_save_lisiting">
  //     <img
  //       src={rowData.image || "https://via.placeholder.com/40"}
  //       alt={rowData.listingTitle}
  //       className=""
  //     />
  //     <span>{rowData.listingTitle}</span>
  //   </div>
  // );



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
        className=""
      />
      <span>{truncatedTitle}</span>
    </div>
  );
};

const CIMAccessNDASubmit = (ndaStatus) => {
  if (ndaStatus === "approved") {
    return (
      <span className="cimAccessNDAsubmit__fields_datatable field__unlock_NDA">
        <i className="pi pi-unlock"></i> CIM Unlocked
      </span>
    );
  } else if (ndaStatus === "pending") {
    return (
      <span className="cimAccessNDAsubmit__fields_datatable field__approve_NDA">
        <i className="pi pi-clock"></i> Waiting for Approval
      </span>
    );
  } else if (ndaStatus === "rejected") {
    return (
      <span className="cimAccessNDAsubmit__fields_datatable field__denied_NDA">
        <i className="pi pi-times"></i> Access Denied
      </span>
    );
  } else {
    return (
      <span className="cimAccessNDAsubmit__fields_datatable field__notAvailable_NDA">
        <i className="pi pi-lock"></i> Not Available
      </span>
    );
  }
};

const CIMAccessLink = (ndaStatus,cimUrl) => {
  console.log("CIM URL:", cimUrl);
  console.log("NDA Status:", ndaStatus);
  if (ndaStatus === "approved") {
    return (
     <>
      {cimUrl? 
      <div className="">
        <Link to={`${API_BASE}${cimUrl}`} className="cim__view_CIMAccessLink">
         <i className="pi pi-file"></i> 
          View CIM
        </Link>
      </div>
       : <div className="cim__view_CIMAccessLink CIMAccessLink__notAvailable">
         <i className="pi pi-file"></i> 
           CIM Not Created
      </div>}
     </>
    );
  } else if (ndaStatus === "pending") {
    return (
      <div className="CIMAccessLink__approval">
        <i className="pi pi-clock"></i> Waiting for Approval
      </div>
    );
  } else if (ndaStatus === "rejected") {
    return (
      <div className="CIMAccessLink__accessDenied">
        <i className="pi pi-lock"></i> 
          CIM Available After Approval
      </div>
    );
  } else {
    return (
      <div className="CIMAccessLink__notAvailable">
        <i className="pi pi-lock"></i> Not Available
      </div>
    );
  }
};
  const ndaStatusTemplate = (row) => {
    const status = row.ndaStatus?.toLowerCase();
    const severity =
      status === "approved"
        ? "success"
        : status === "pending"
        ? "warning"
        : "danger";
    return <Tag value={row.ndaStatus} severity={severity} />;
  };


const DueDiligenceAction = (statusNDA, Id) => { 
  return (
    <>
 {statusNDA === "approved" ? (<><Link to={`/user/due-diligence/${Id}`}> view</Link></>) : statusNDA === "pending" ? (<><Tag value={statusNDA} severity="warning" /></>) : (<><Tag value={statusNDA} severity="danger" /></>)}
    </>
  );
}


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



  const ndaStatusCounts = ndaData?.reduce(
  (acc, nda) => {
    const status = (nda?.ndaStatus || "").toLowerCase();

    if (status === "approved") acc.approved += 1;
    else if (status === "pending") acc.pending += 1;
    else if (status === "rejected") acc.rejected += 1;
    else acc.other += 1;

    return acc;
  },
  { approved: 0, pending: 0, rejected: 0, other: 0 }
);


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
            <h3>NDA Requested</h3>
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
            <h3>NDA Status</h3>
            <Chart
                type="doughnut"
                data={{
                  labels: ["Approved", "Pending", "Rejected", "Other"],
                  datasets: [
                    {
                      data: [
                        ndaStatusCounts?.approved ?? 0,
                        ndaStatusCounts?.pending ?? 0,
                        ndaStatusCounts?.rejected ?? 0,
                        ndaStatusCounts?.other ?? 0,
                      ],
                      backgroundColor: ["#66BB6A", "#FFA726", "#EF5350", "#9E9E9E"],
                    },
                  ],
                }}
              />

          </div>

          <div className="listing__dashboard_listing_widget lisiting_recent_view_widget">
           <div className="listing__dashboard_listing_widget_header">
              <h3>NDA Requests</h3>
              <NavLink
                to="/user/nda-requested"
                className="view_all"
              >
                View All
              </NavLink>
            </div>

              <DataTable
        value={ndaList}
        loading={loading}
        paginator
        rows={10}
        stripedRows
        emptyMessage="No NDA requests found."
      >
       <Column
  header="Listing Name"
  sortable
  body={(rowData) => {
    const text = rowData?.listingTitle || "";
    const words = text.split(" ");
    return words.length > 6 ? words.slice(0, 6).join(" ") + "..." : text;
  }}
/>

<Column
          field="ndaStatus"
          header="NDA Status"
          body={ndaStatusTemplate}
          sortable
        />
        <Column body={(rowData) => CIMAccessNDASubmit(rowData?.ndaStatus)} header="CIM Access" />
        <Column body={(rowData) =>  rowData?.submittedOn ? new Date(rowData?.submittedOn).toLocaleDateString() : "-"} header="Submitted On" />
        <Column body={(rowData) =>  rowData?.sellerResponseOn ? new Date(rowData?.sellerResponseOn).toLocaleDateString() : "-"} header="Seller Response" />
        {/* <Column body={(rowData) =>  rowData?.docRoomAccess === "approved" ? (<><Link to={`/user/document-room/${rowData?.businessId}`} className="cim__view_CIMAccessLink">  <i className="pi pi-file"></i> View Doc Room</Link></>) : (<><div className="CIMAccessLink__accessDenied"> <i className="pi pi-lock"></i> View After Approval</div></>)} header="Document Room" />
       <Column body={(rowData) => DueDiligenceAction(rowData?.ndaStatus, rowData?.businessId)} header="Due Diligence" />

        */}
      </DataTable>
          </div>
        </div>

        {/* ---------- Saved Listings ---------- */}
        <div className="listing__dashboard_weakly_activity listing__dashboard_save_listing buyer__dashboard">
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
<div className="listing__dashboard_nda_request_data_tables width__full">

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

        {error && <p className="error_text">{error}</p>}
      </div>
    </>
  );
};

export default SellerCentralDashboard;
