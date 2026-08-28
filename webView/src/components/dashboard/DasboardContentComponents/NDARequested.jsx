import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRecoilValue } from "recoil";
import { Link } from "react-router-dom";
import { Tag } from "primereact/tag";
import { apiBaseUrlState, authState } from "../../../recoil/ctaState";
import DashboardHeader from "./DashboardHeaderBlock";
import ResponsiveDataTable from "../../customcomponent/ResponsiveDataTable";

export default function NdaRequests() {
  const [ndaList, setNdaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const apiBaseUrl = useRecoilValue(apiBaseUrlState);
  const { access_token } = useRecoilValue(authState) ?? {};

  useEffect(() => {
    const fetchNdaList = async () => {
      try {
        const { data } = await axios.get(`${apiBaseUrl}/nda`, {
          headers: {
            Authorization: `Bearer ${access_token}`,
            "Content-Type": "application/json",
          },
        });
        setNdaList(data.data || []);
      } catch (error) {
        console.error("Error fetching NDA list:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNdaList();
  }, [apiBaseUrl, access_token]);

  const OpenCim = (nfaId) => {
    fetch(`${apiBaseUrl}/nda/cim-url/${nfaId}`, {
      headers: { Authorization: `Bearer ${access_token}` },
    })
      .then((res) => res.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        window.open(url);
      });
  };

  // 🔹 Render Helpers
  const renderCIMAccessStatus = (ndaStatus) => {
    const statusMap = {
      approved: { class: "field__unlock_NDA", icon: "pi-unlock", text: "CIM Unlocked" },
      pending: { class: "field__approve_NDA", icon: "pi-clock", text: "Waiting for Approval" },
      rejected: { class: "field__denied_NDA", icon: "pi-times", text: "Access Denied" },
    };
    const current = statusMap[ndaStatus] || { class: "field__notAvailable_NDA", icon: "pi-lock", text: "Not Available" };

    return (
      <span className={`cimAccessNDAsubmit__fields_datatable ${current.class}`}>
        <i className={`pi ${current.icon}`}></i> {current.text}
      </span>
    );
  };

  const renderCIMActionLink = (cimAccess, cimUrl, id, ndaStatus) => {
    if (cimAccess === "approved") {
      return cimUrl ? (
        <div onClick={() => OpenCim(id)} className="cim__view_CIMAccessLink">
          <i className="pi pi-file"></i> Open CIM
        </div>
      ) : (
        <div className="cim__view_CIMAccessLink CIMAccessLink__notAvailable">
          <i className="pi pi-file"></i> CIM Not Created
        </div>
      );
    }
    if (ndaStatus === "pending") {
      return (
        <div className="CIMAccessLink__approval">
          <i className="pi pi-clock"></i> Waiting for Approval
        </div>
      );
    }
    if (ndaStatus === "rejected") {
      return (
        <div className="CIMAccessLink__accessDenied">
          <i className="pi pi-lock"></i> CIM Available After Approval
        </div>
      );
    }
    return (
      <div className="CIMAccessLink__notAvailable">
        <i className="pi pi-lock"></i> Not Available
      </div>
    );
  };

  // 🔹 Responsive Table Configuration
  const ndaColumns = [
    {
      field: "listingTitle",
      header: "Listing Name",
      primary: true,
      sortable: true,
      body: (rowData) => {
        const text = rowData?.listingTitle || "";
        const words = text.split(" ");
        return words.length > 6 ? `${words.slice(0, 6).join(" ")}...` : text;
      },
    },
    {
      field: "ndaStatus",
      header: "NDA Status",
      sortable: true,
      body: (rowData) => {
        const status = rowData.ndaStatus?.toLowerCase();
        const severity = status === "approved" ? "success" : status === "pending" ? "warning" : "danger";
        return <Tag value={rowData.ndaStatus} severity={severity} />;
      },
    },
    {
      field: "cimStatus",
      header: "CIM Access",
      body: (rowData) => renderCIMAccessStatus(rowData?.ndaStatus),
    },
    {
      field: "submittedOn",
      header: "Submitted On",
      body: (rowData) => (rowData?.submittedOn ? new Date(rowData.submittedOn).toLocaleDateString() : "-"),
    },
    {
      field: "sellerResponseOn",
      header: "Seller Response",
      body: (rowData) => (rowData?.sellerResponseOn ? new Date(rowData.sellerResponseOn).toLocaleDateString() : "-"),
    },
    {
      field: "docRoom",
      header: "Document Room",
      body: (rowData) =>
        rowData?.docRoomAccess === "approved" ? (
          <Link to={`/user/document-room/${rowData?.businessId}`} className="cim__view_CIMAccessLink">
            <i className="pi pi-file"></i> View Doc Room
          </Link>
        ) : (
          <div className="CIMAccessLink__accessDenied">
            <i className="pi pi-lock"></i> View After Approval
          </div>
        ),
    },
    {
      field: "actions",
      header: "Actions",
      body: (rowData) => renderCIMActionLink(rowData?.cimAccess, rowData?.cimUrl, rowData?._id, rowData?.ndaStatus),
    },
  ];

  return (
    <div className="p-4">
      <DashboardHeader headingData="NDA Requests" />
      <div className="brief__infor_content">
        <p>
          View and manage all your NDA submissions for private listings. NDAs must be approved to unlock CIMs and seller messaging.
        </p>
      </div>

      <div className="business__list_single_nda_submit_row">
        <div className="business__list_single_nda_submit_row_intro_head_copy">
          <h2 className="business__list_single_nda_submit_row_intro_head nda__listing_heading">
            Want full access to seller messaging and CIMs?
          </h2>
          <p className="business__list_single_nda_submit_row_body_copy">
            Upgrade your account to unlock all documents and direct communication tools.
          </p>
        </div>
      </div>

      <div className="my__save_listing_wrap my__listing_table nda__request_block">
        <ResponsiveDataTable
          value={ndaList}
          columns={ndaColumns}
          loading={loading}
          paginator
          rows={10}
          dataKey="_id"
          emptyMessage="No NDA requests found."
          cardBreakpoint="768px"
        />
      </div>
    </div>
  );
}