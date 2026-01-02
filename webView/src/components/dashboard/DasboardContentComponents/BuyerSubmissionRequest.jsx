import React, { useEffect, useState,useRef } from "react";
import notifInfo from "../../../assets/notifInfo.png";
import serachIcon from "../../../assets/serachIcon.png";
import userImg from "../../../assets/userImg.png";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import axios from "axios";
import { useRecoilValue } from "recoil";
import { authState, apiBaseUrlState } from "../../../recoil/ctaState";
import { Tag } from "primereact/tag";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Link } from "react-router-dom";
import { Message } from "primereact/message";

import SignatureCanvas from "react-signature-canvas";
import DashboardHeader from "./DashboardHeaderBlock";

const BuyerSubmissionRequest = () => {
  const [buyerSubmissions, setBuyerSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buyerSignature, setBuyerSignature] = useState(null);
  const {user, access_token } = useRecoilValue(authState) ?? {};
  const apiBaseUrl = useRecoilValue(apiBaseUrlState);
  const [search, setSearch] = useState("");
  const [visible, setVisible] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const toast = React.useRef(null);
  const sigCanvasRef = useRef(null);
  const today = new Date().toLocaleDateString("en-US");
  // Fetch Buyer NDA submissions
  useEffect(() => {
    fetchBuyerSubmissions();
  }, []);

  const fetchBuyerSubmissions = async () => {
    try {
      const { data } = await axios.get(`${apiBaseUrl}/nda/owner-submissions`, {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      setBuyerSubmissions(data.data);
    } catch (error) {
      console.error("Error fetching Buyer NDA submissions:", error);
    } finally {
      setLoading(false);
    }
  };

  // Search filter
  const filteredData = buyerSubmissions.filter((item) =>
    item.businessName?.toLowerCase().includes(search.toLowerCase())
  );

  const listingBuyerName = (businessId, name) => (
    <>
     <span>{name}</span>
    </>
  );

  const formatDate = (dateStr) =>
    dateStr
      ? new Date(dateStr).toLocaleString("en-US", {
          year: "numeric",
          month: "short",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "—";

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
    /* =========================
     Signature Handlers
  ========================= */
const handleSignatureSave = () => {
  if (!sigCanvasRef.current || sigCanvasRef.current.isEmpty()) {
    setBuyerSignature("");
    return;
  }

  // react-signature-canvas already trims whitespace
  const dataUrl = sigCanvasRef.current
    .toDataURL("image/png");

  setBuyerSignature(dataUrl);
};
  const clearSignature = () => {
  sigCanvasRef.current?.clear();
  setBuyerSignature(null);
};

  // Open Modal
  const openModal = (row) => {
    setSelectedSubmission(row);
    setVisible(true);
  };

  // Approve / Reject handlers
 const handleNDAAction = async (actionType, signatureData = "") => {
  if (!selectedSubmission?._id) return;

  const url =
    actionType === "approve"
      ? `${apiBaseUrl}/nda/approve`
      : `${apiBaseUrl}/nda/reject`;

  setSubmitting(true);
  try {
    // Construct the payload to match the Postman screenshot
    const payload = {
      ndaId: selectedSubmission._id,
      status: actionType === "approve" ? "approved" : "rejected",
      // Include the base64 signature string if approving
      sellerSignature: actionType === "approve" ? buyerSignature : null 
    };

    await axios.patch(
      url,
      payload,
      {
        headers: { Authorization: `Bearer ${access_token}` },
      }
    );

    toast.current.show({
      severity: "success",
      summary: `NDA ${actionType === "approve" ? "Approved" : "Rejected"}`,
      life: 3000,
    });

    setVisible(false);
    fetchBuyerSubmissions();
  } catch (err) {
    toast.current.show({
      severity: "error",
      summary: "Action Failed",
      detail: err?.response?.data?.message || "Please try again",
      life: 3000,
    });
  } finally {
    setSubmitting(false);
  }
};

  const ndaViewActionTemplate = (row) => (
    <Button
      label="View Buyer Submission"
      link
      onClick={() => openModal(row)}
      className="viewBuyer__button"
    />
  );


const DueDiligenceAction = (statusNDA, Id) => { 
  return (
    <>
 {statusNDA === "approved" ? (<><Link to={`/user/due-diligence/${Id}`}> view</Link></>) : statusNDA === "pending" ? (<><Tag value={statusNDA} severity="warning" /></>) : (<><Tag value={statusNDA} severity="danger" /></>)}
    </>
  );
}


  return (
    <>
      <Toast ref={toast} />
      <DashboardHeader headingData="Buyer Submissions"/>
      <div className="brief__infor_content">
        <p>
          These buyers have shown interest in your listing by submitting a
          completed buyer profile and NDA. Review their information and
          determine if they’re a potential fit.
        </p>
      </div>

      <div className="my__save_listing_wrap my__listing_table nda__request_block">
        <DataTable
          value={filteredData}
          loading={loading}
          paginator
          rows={10}
          stripedRows
          emptyMessage="No Buyer Submission"
          responsiveLayout="scroll"
        >
          <Column
            body={(rowData) =>
              listingBuyerName(rowData.businessId, rowData.businessName)
            }
            header="Name"
            sortable
          />
          <Column field="buyerName" header="Business Name" sortable />
          <Column field="submittedByEmail" header="Email" />
          <Column
            field="submittedOn"
            header="Submitted On"
            body={(row) => formatDate(row.submittedOn)}
          />
          <Column
            field="sellerResponseOn"
            header="Seller Responded On"
            body={(row) => formatDate(row.sellerResponseOn)}
          />
          <Column
            field="ndaStatus"
            header="NDA Status"
            body={ndaStatusTemplate}
            sortable
          />
          <Column body={(row) => DueDiligenceAction(row.ndaStatus, row.businessId)} header="Due Diligence" />
          <Column header="Action" body={ndaViewActionTemplate} />
        </DataTable>
      </div>

      {/* NDA Modal */}
      <Dialog
        header="Buyer Submission Details"
        visible={visible}
        style={{ width: "992px" }}
        onHide={() => setVisible(false)}
        className="nda__buyer_submission_details_wrap"
      >
        {selectedSubmission && (
          <div className="nda__modal_content">
             <div className="sign__sec_nda">
              <div className="sign__sec_buyer">
                  <img src={selectedSubmission.buyerSignature} alt="Buyer Sig" style={{ maxHeight: '100%' }} />
                  <p>Name: {selectedSubmission.buyerName}</p>
                  <p>Date: {formatDate(selectedSubmission.submittedOn)}</p>
                  <p>Email: {selectedSubmission.submittedByEmail}</p>
              </div>
              <div className="sign__sec_seller">
        <div className="nda__signature_wrap">
          <label className="font-medium mb-2 block">Seller Signature</label>

          <div className="signature__canvas">
            <SignatureCanvas
              ref={sigCanvasRef}
              penColor="black"
              canvasProps={{
                width: 460,
                height: 150,
                className: "signature-canvas",
                onMouseUp: handleSignatureSave,
                onTouchEnd: handleSignatureSave,
              }}
            />
          </div>

          <div className="flex justify-content-end mt-2">
            <Button
              type="button"
              label="Clear"
              icon="pi pi-refresh"
              className="p-button-text p-button-sm"
              onClick={clearSignature}
            />
          </div>
        </div>

        {!buyerSignature && (
          <Message
            severity="warn"
            text="Please provide your signature before submitting."
          />
        )}
                  
        <p><strong>Name:</strong> {user.first_name || ""} {user.last_name || ""}</p>
        <p><strong>Date:</strong> {today}</p>
        <p><strong>Email:</strong> {user.email || "Seller Email"}</p>
       

              </div>
             </div>
             
          

            <div className="nda__modal_actions" >
              <Button
                label="Share CIM"
                onClick={() => handleNDAAction("approve")}
                loading={submitting}
                className="btn__NDARequest_shareCIM"
                disabled={ !buyerSignature}
              />
              <Button
                label="Decline Access"
                onClick={() => handleNDAAction("reject")}
                loading={submitting}
                className="btn__NDARequest_decline"
              />
            </div>
          </div>
        )}
      </Dialog>
    </>
  );
};

export default BuyerSubmissionRequest;
