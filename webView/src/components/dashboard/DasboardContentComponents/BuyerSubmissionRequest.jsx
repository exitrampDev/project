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
import ResponsiveDataTable from "../../customcomponent/ResponsiveDataTable";
import SignatureCanvas from "react-signature-canvas";
import DashboardHeader from "./DashboardHeaderBlock";

const BuyerSubmissionRequest = () => {
  const [buyerInfoVisible, setBuyerInfoVisible] = useState(false);
const [selectedBuyer, setSelectedBuyer] = useState(null);

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
    item.listingTitle?.toLowerCase().includes(search.toLowerCase())
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
 const handleNDAAction = async (actionType, sellerSignatureApproved) => {
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
      sellerSignature: actionType === "approve" ? sellerSignatureApproved : null
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
const openPdf = () => {
  let file = selectedBuyer.buyer?.profile?.verification_file;
  if (!file) return;

  try {
    // Remove data URL prefix if exists
    const base64 = file.includes("base64,")
      ? file.split("base64,")[1]
      : file;

    // Clean base64 (important fix)
    const cleanedBase64 = base64.replace(/\s/g, "");

    // Convert to binary
    const byteCharacters = atob(cleanedBase64);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);

    // Create Blob
    const blob = new Blob([byteArray], { type: "application/pdf" });

    // Open in new tab
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");

  } catch (err) {
    console.error("Invalid base64:", err);
    alert("File is corrupted or not valid PDF");
  }
};
const DueDiligenceAction = (statusNDA, Id) => { 
  return (
    <>
 {statusNDA === "approved" ? (<><Link to={`/user/due-diligence/${Id}`}> view</Link></>) : statusNDA === "pending" ? (<><Tag value={statusNDA} severity="warning" /></>) : (<><Tag value={statusNDA} severity="danger" /></>)}
    </>
  );
}
const openBuyerInfoModal = (row) => {
  setSelectedBuyer(row);
  setBuyerInfoVisible(true);
};

const buyerSubmissionColumns = [
  {
    field: "listingTitle",
    header: "Listing Name",
    primary: true,
    sortable: true,
    body: (rowData) => {
      const text = rowData?.listingTitle || "-";
      const words = text.split(" ");

      return words.length > 4
        ? `${words.slice(0, 4).join(" ")}...`
        : text;
    },
  },
  {
    field: "buyer",
    header: "Buyer Name",
    sortable: true,
    body: (rowData) => (
      <span
        onClick={() => openBuyerInfoModal(rowData)}
        style={{
          cursor: "pointer",
          color: "#2563eb",
          fontWeight: 500,
          textDecoration: "underline",
        }}
      >
        {rowData?.buyer?.first_name || ""}{" "}
        {rowData?.buyer?.last_name || ""}
      </span>
    ),
  },
  {
    field: "submittedByEmail",
    header: "Email",
  },
  {
    field: "submittedOn",
    header: "Submitted On",
    body: (row) => formatDate(row.submittedOn),
  },
  {
    field: "sellerResponseOn",
    header: "Seller Responded On",
    body: (row) => formatDate(row.sellerResponseOn),
  },
  {
    field: "ndaStatus",
    header: "NDA Status",
    body: ndaStatusTemplate,
    sortable: true,
  },
  {
    field: "dueDiligence",
    header: "Due Diligence",
    body: (row) =>
      DueDiligenceAction(row.ndaStatus, row.businessId),
  },
  {
    field: "actions",
    header: "Action",
    body: ndaViewActionTemplate,
  },
];
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
        <ResponsiveDataTable
  value={filteredData}
  columns={buyerSubmissionColumns}
  loading={loading}
  paginator
  rows={10}
  stripedRows
  dataKey="_id"
  emptyMessage="No Buyer Submission"
  responsiveLayout="scroll"
  cardBreakpoint="768px"
/>
      </div>

      {/* NDA Modal */}
      <Dialog
        header="Mutual Non-Disclosure Agreement"
        visible={visible}
        style={{ width: "992px" }}
        onHide={() => setVisible(false)}
        className="nda__buyer_submission_details_wrap"
      >
        {selectedSubmission && (
          <div className="nda__modal_content">
            <div className="nda__agreement_wrap">

      <h3>I. THE PARTIES</h3>

      <p>
        This Non-Disclosure Agreement, hereinafter known as the
        <strong> “Agreement”</strong>, created on this day{" "}
        <strong>
          {new Date(selectedSubmission.submittedOn).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  )}  
        </strong>, is between{" "}

        <strong>{selectedSubmission.buyer?.first_name} {selectedSubmission.buyer?.last_name}</strong>, hereinafter known as{" "}
        <strong>“Party A”</strong>, and the listing owner of{" "}
        <strong>
          {selectedSubmission.listingTitle}  (Listing ID: #{selectedSubmission.businessId.toString().slice(-6)})
        </strong>
        , hereinafter known as <strong>“Party B”</strong>, and collectively
        known as the <strong>“Parties”</strong>.
      </p>

      <p>
        WHEREAS this Agreement is created for the purpose of preventing the
        unauthorized disclosure of confidential and proprietary information.
      </p>

      <p className="nda__section_intro">
        The Parties Agree to the Following:
      </p>

      <h3>II. TYPE OF AGREEMENT</h3>
      <p>
        This Agreement shall be <strong>Mutual</strong>, whereas the Parties
        shall be prohibited from disclosing confidential and proprietary
        information that is to be shared between one another.
      </p>

      <h3>III. RELATIONSHIP</h3>
      <p>
        Party A’s relationship to Party B can be described as{" "}
        <strong>Recipient</strong>, and Party B’s relationship to Party A can
        be described as <strong>Discloser</strong>.
      </p>

      <h3>IV. DEFINITION</h3>
      <p>
        For the purposes of this Agreement, the term{" "}
        <strong>“Confidential Information”</strong> shall include, but not be
        limited to, documents, records, information and data (whether verbal,
        electronic or written), drawings, models, apparatus, sketches, designs,
        schedules, product plans, marketing plans, technical procedures,
        manufacturing processes, analyses, compilations, studies, software,
        prototypes, samples, formulas, methodologies, formulations, product
        developments, patent applications, know-how, experimental results,
        specifications, and other business information relating to Party B’s
        business, assets, operations, or contracts.
      </p>

      <p>
        Confidential Information also includes any work products, studies, or
        materials prepared by or in the possession or control of the other
        Party that contain or reflect such Confidential Information.
      </p>

      <p>
        Confidential Information does <strong>not</strong> include:
      </p>

      <ul>
        <li>Information generally available to the public</li>
        <li>Widely used programming practices or algorithms</li>
        <li>
          Information rightfully in the possession of the Parties prior to
          signing this Agreement
        </li>
        <li>
          Information independently developed without the use of provided
          Confidential Information
        </li>
      </ul>

      <h3>V. OBLIGATIONS</h3>
      <p>
        The Parties shall hold and maintain all Confidential Information in
        strict confidence and disclose it only to individuals on a
        “need-to-know” basis. Any unauthorized disclosure shall result in full
        liability for the disclosing Party.
      </p>

      <p>
        Neither Party shall, without written approval, publish, copy, or use
        Confidential Information for personal benefit. Upon request, all
        materials shall be returned within <strong>30 days</strong>.
      </p>

      <h3>VI. TIME PERIOD</h3>
      <p>
        The duty to maintain confidentiality shall remain in effect until such
        information no longer qualifies as a trade secret or written release
        is provided.
      </p>

      <h3>VII. INTEGRATION</h3>
      <p>
        This Agreement constitutes the complete understanding between the
        Parties and supersedes all prior agreements. Amendments must be in
        writing and acknowledged by both Parties.
      </p>

      <h3>VIII. SEVERABILITY</h3>
      <p>
        If any provision is found unenforceable, the remainder shall continue
        in full force and effect.
      </p>

      <h3>IX. ENFORCEMENT</h3>
      <p>
        The Parties acknowledge that breach of this Agreement may cause
        irreparable harm and that equitable and legal remedies may be pursued.
      </p>

      <h3>X. GOVERNING LAW</h3>
      <p>
        This Agreement shall be governed under the laws of the State of{" "}
        {/* <strong>{businessState}</strong>. */}
      </p>

      <p className="nda__signature_note">
        By typing your name below, you acknowledge and agree to all terms and
        conditions outlined in this Agreement and provide your electronic
        signature.
      </p>
    </div>
             <div className="sign__sec_nda">
              <div className="sign__sec_buyer">
                <label className="font-medium mb-2 block">Buyer Signature</label>
                  <p><strong>Name:</strong>  {selectedSubmission.buyer?.first_name} {selectedSubmission.buyer?.last_name}</p>
                  <p><strong>Date:</strong> {formatDate(selectedSubmission.submittedOn)}</p>
                  <p><strong>Email:</strong> {selectedSubmission.submittedByEmail}</p>
                  
                  <div className="buyerSig__wrap">
                    <img src={selectedSubmission.buyerSignature} alt="Buyer Sig" className="buyerSig" />
                  </div>
              </div>
              <div className="sign__sec_seller">
        <div className="nda__signature_wrap">
          <label className="font-medium mb-2 block">Seller Signature</label>
   <p><strong>Name:</strong> {user.first_name || ""} {user.last_name || ""}</p>
        <p><strong>Date:</strong> {today}</p>
        <p><strong>Email:</strong> {user.email || "Seller Email"}</p>
          <div className="signature__canvas">

            {selectedSubmission?.sellerSignature ? <img src={selectedSubmission?.sellerSignature} alt="Seller Sig" className="sellerSig" /> :            
            
         <>
         
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
         </>
}
          </div>

{selectedSubmission.sellerSignature ? "" : 

<>

<div className="flex justify-content-end mt-2">
  <Button
    type="button"
    label="Clear"
    icon="pi pi-refresh"
    className="p-button-text p-button-sm"
    onClick={clearSignature}
  />
</div>

{!buyerSignature && (
  <Message
  severity="warn"
  text="Please provide your signature before submitting."
/>
)}
        

</>
}
     
</div>
       

              </div>
             </div>
             
          

            <div className="nda__modal_actions" >
              <Button
                label="Approve NDA"
                onClick={() => handleNDAAction("approve", selectedSubmission?.sellerSignature ? selectedSubmission?.sellerSignature : buyerSignature)}
                loading={submitting}
                className="btn__NDARequest_shareCIM"
                disabled={  selectedSubmission.ndaStatus === "approved"}
              />
              <Button
                label="Decline Access"
                onClick={() => handleNDAAction("reject")}
                loading={submitting}
                className="btn__NDARequest_decline"
                disabled={  selectedSubmission.ndaStatus === "rejected"}
              />
            </div>
          </div>
        )}
      </Dialog>
     <Dialog
  header="Buyer Information"
  className="buyer__info_pop"
  visible={buyerInfoVisible}
  style={{ width: "992px" }}
  onHide={() => setBuyerInfoVisible(false)}
>
  {selectedBuyer?.buyer && (
    <div className="buyer__info_modal">
      <div className="buyer__modal_fields">
        <strong>Name:</strong>{" "}
        {selectedBuyer?.buyer?.first_name} {selectedBuyer?.buyer?.last_name}
      </div>



      <div className="buyer__modal_fields">
        <strong>Email:</strong> {selectedBuyer.buyer.email}
      </div>

      <div className="buyer__modal_fields">
        <strong>Phone:</strong> {selectedBuyer?.buyer?.profile?.phone}
      </div>
  
      {/* <div className="buyer__modal_fields">
        <strong>Business Type Preferred:</strong>{" "}
        {selectedBuyer.buyer?.profile?.business_type_preferred ? selectedBuyer.buyer?.profile?.business_type_preferred : "-"}
      </div> */}
      <div className="buyer__modal_fields">
        <strong>Purchase Budget:</strong>{" "}
        {selectedBuyer.buyer?.profile?.investment_budget
        ? new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0
          }).format(selectedBuyer.buyer?.profile?.investment_budget? selectedBuyer.buyer?.profile?.investment_budget : "-")
        : "N/A"}
      </div>


      <div className="buyer__modal_fields">
        <strong>Liquid Assets:</strong>{" "}
        {selectedBuyer.buyer?.profile?.liquid_assets
          ? new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              maximumFractionDigits: 0
            }).format(selectedBuyer.buyer?.profile?.liquid_assets)
          : "N/A"}
      </div>

      {/* <div className="buyer__modal_fields">
        <strong>Financing:</strong>{" "}
        {selectedBuyer.buyer?.profile?.financing ? selectedBuyer.buyer?.profile?.financing : "-"}
      </div> */}

      <div className="buyer__modal_fields">
        <strong>How Do You Plan To Fund Your Purchase:</strong>{" "}
        {selectedBuyer.buyer?.profile?.funding_plan ? selectedBuyer.buyer?.profile?.funding_plan : "-"}
      </div>

      <div className="buyer__modal_fields">
        <strong>Area of interest:</strong>{" "}
        {selectedBuyer.buyer?.profile?.industry ? selectedBuyer.buyer?.profile?.industry : "-"}
      </div>

      {/* <div className="buyer__modal_fields">
        <strong>Previous Experience:</strong>{" "}
        {selectedBuyer.buyer?.profile?.previous_experience ? selectedBuyer.buyer?.profile?.previous_experience : "-"}
      </div> */}



 <div className="buyer__modal_fields">
        <strong>How Soon Look in To Acquire:</strong>{" "}
        {selectedBuyer.buyer?.profile?.timeline ? selectedBuyer.buyer?.profile?.timeline : "-"}
      </div>
      

      <div className="buyer__modal_fields">
        <strong>Submitted On:</strong>{" "}
        {formatDate(selectedBuyer.submittedOn)}
      </div>

      <div className="buyer__modal_fields">
        <strong>NDA Status:</strong>{" "}
        <Tag
          value={selectedBuyer.ndaStatus}
          severity={
            selectedBuyer.ndaStatus === "approved"
              ? "success"
              : selectedBuyer.ndaStatus === "pending"
              ? "warning"
              : "danger"
          }
        />
      </div>
      <div className="buyer__modal_fields">
        <strong>Financial Verification:</strong>{" "}
        <Tag
          value={selectedBuyer.buyer?.profile?.financial_verification}
          severity={
            selectedBuyer.buyer?.profile?.financial_verification === "yes"
              ? "success"
              : selectedBuyer.buyer?.profile?.financial_verification === "no"
              ? "warning"
              : "danger"
          }
        />
      </div>
      
<div className="buyer__modal_fields">
  <strong>Financial Verification File:</strong>{" "}
  
  {selectedBuyer.buyer?.profile?.financial_verification === "yes" &&
   selectedBuyer.buyer?.profile?.verification_file ? (
    
    <div
      className="buyer__modal_fields_link"
      onClick={openPdf}
    >
      View Files
    </div>


  ) : (
    "-"
  )}
</div>
 <div className="buyer__modal_fields buyer__background">
        <strong>Buyer Background:</strong>{" "}
        {selectedBuyer.buyer?.profile?.background ? selectedBuyer.buyer?.profile?.background : "-"}
      </div>


    </div>
  )}
</Dialog>


    </>
  );
};

export default BuyerSubmissionRequest;
