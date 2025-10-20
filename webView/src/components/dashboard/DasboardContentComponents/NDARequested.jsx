import React, { useEffect, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import axios from "axios";
import notifInfo from "../../../assets/notifInfo.png";
import serachIcon from "../../../assets/serachIcon.png";
import userImg from "../../../assets/userImg.png";
import { useRecoilValue } from "recoil";
import { apiBaseUrlState, authState } from "../../../recoil/ctaState";
import { Button } from "primereact/button";
import { Link } from "react-router-dom";
import { Tag } from "primereact/tag";


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
  }, [apiBaseUrl, access_token]);
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


const CIMAccessLink = (ndaStatus,id) => {
  if (ndaStatus === "approved") {
    return (
      <div className="">
        <Link to={`/user/cim/${id}`} className="cim__view_CIMAccessLink">
         <i className="pi pi-file"></i> 
          View CIM
        </Link>
      </div>
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
  return (
    <div className="p-4">
      <div className="dashboard__header_block">
              <h3 className="heading__Digital_CIM">
                {" "}
               NDA Requests 
              </h3>

              <div className="dashboard__header_search_notification_wrap">
                <div className="dashboard__search_field_wrap">
                  <input type="text" placeholder="Search" />
                  <img src={serachIcon} alt="" />
                </div>
                <div className="dashboard__notification_wrap">
                  <button>
                    <img src={notifInfo} alt="" />
                  </button>
                </div>
                <div className="dashboard__user_wrap">
                  <button>
                    <img src={userImg} alt="" />
                  </button>
                </div>
              </div>
            </div>

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
              <div className="business__list_single_nda_submit_row_intro_btns">
        <Button className="business__list_complete_profile_btn " >
          Upgrade Now
        </Button>

        
                </div>

            </div>
     <div className="my__save_listing_wrap my__listing_table nda__request_block">
        <DataTable
        value={ndaList}
        loading={loading}
        paginator
        rows={10}
        stripedRows
        emptyMessage="No NDA requests found."
      >
        <Column field="businessName" header="Listing Name" sortable />
       <Column
          field="ndaStatus"
          header="NDA Status"
          body={ndaStatusTemplate}
          sortable
        />
        <Column body={(rowData) => CIMAccessNDASubmit(rowData.ndaStatus)} header="CIM Access" />
        <Column body={(rowData) =>  rowData.submittedOn ? new Date(rowData.submittedOn).toLocaleDateString() : "-"} header="Submitted On" />
        <Column body={(rowData) =>  rowData.sellerResponseOn ? new Date(rowData.sellerResponseOn).toLocaleDateString() : "-"} header="Seller Response" />
        <Column body={(rowData) =>  rowData.docRoomAccess === "approved" ? (<><Link to={`/user/document-room-buyer/${rowData.businessId}`} className="cim__view_CIMAccessLink">  <i className="pi pi-file"></i> View Doc Room</Link></>) : (<><div className="CIMAccessLink__accessDenied"> <i className="pi pi-lock"></i> View After Approval</div></>)} header="Document Room" />
        <Column body={(rowData) => CIMAccessLink(rowData.ndaStatus,rowData.businessId)} header="Actions" />
      </DataTable>
        </div>   
        
    </div>
  );
}
