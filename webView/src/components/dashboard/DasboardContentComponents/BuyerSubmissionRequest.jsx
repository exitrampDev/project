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
const openBuyerInfoModal = (row) => {
  setSelectedBuyer(row);
  setBuyerInfoVisible(true);
};


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
              header="Listing Name"
              sortable
              body={(rowData) => {
                const text = rowData?.listingTitle || "";
                const words = text.split(" ");
                return words.length > 4 ? words.slice(0, 4).join(" ") + "..." : text;
              }}
            />
          <Column
            header="Buyer Name"
            sortable
            body={(rowData) => (
              <span
                onClick={() => openBuyerInfoModal(rowData)}
                style={{
                  cursor: "pointer",
                  color: "#2563eb",
                  fontWeight: 500,
                  textDecoration: "underline"
                }}
              >
                {rowData.buyerName}
              </span>
            )}
          />


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

        <strong>{selectedSubmission.buyerName}</strong>, hereinafter known as{" "}
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
                  <p><strong>Name:</strong>  {selectedSubmission.buyerName}</p>
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
                  
     
       

              </div>
             </div>
             
          

            <div className="nda__modal_actions" >
              <Button
                label="Approve NDA"
                onClick={() => handleNDAAction("approve")}
                loading={submitting}
                className="btn__NDARequest_shareCIM"
                disabled={ !buyerSignature || selectedSubmission.ndaStatus === "approved"}
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
        {selectedBuyer.buyer.firstName} {selectedBuyer.buyer.lastName}
      </div>



      <div className="buyer__modal_fields">
        <strong>Email:</strong> {selectedBuyer.buyer.email}
      </div>

      <div className="buyer__modal_fields">
        <strong>Phone:</strong> {selectedBuyer.buyer.phone}
      </div>

      <div className="buyer__modal_fields">
        <strong>Industry of Interest:</strong>{" "}
        {selectedBuyer.buyer.industryOfInterest}
      </div>

      <div className="buyer__modal_fields">
        <strong>Region of Interest:</strong>{" "}
        {selectedBuyer.buyer.regionOfInterest}
      </div>

      <div className="buyer__modal_fields">
        <strong>Investment Budget:</strong>{" "}
        {selectedBuyer.buyer.investmentBudget}
      </div>

      <div className="buyer__modal_fields">
        <strong>Liquid Assets:</strong>{" "}
        {selectedBuyer.buyer.liquidAssetToSupporPurchase}
      </div>

      <div className="buyer__modal_fields">
        <strong>Financing Placed:</strong>{" "}
        {selectedBuyer.buyer.financingIsPlaced}
      </div>

      <div className="buyer__modal_fields">
        <strong>Previous Acquisition Experience:</strong>{" "}
        {selectedBuyer.buyer.previousAcquisitionExperience}
      </div>

      <div className="buyer__modal_fields">
        <strong>Background:</strong>{" "}
        {selectedBuyer.buyer.briefBackground}
      </div>

      <div className="buyer__modal_fields">
        <strong>Business Type Preferrd:</strong>{" "}
        {selectedBuyer.buyer.businessTypePreferrd}
      </div>


        <div className="buyer__modal_fields">
        <strong>How Do You Plan To Fund Your Purchase:</strong>{" "}
        {selectedBuyer.buyer.howDoYouPlanToFundYourPurchase}
      </div>


 <div className="buyer__modal_fields">
        <strong>How Soon Look in To Acquire:</strong>{" "}
        {selectedBuyer.buyer.howSoonLookinToAcquire}
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
    </div>
  )}
</Dialog>


    </>
  );
};

export default BuyerSubmissionRequest;
