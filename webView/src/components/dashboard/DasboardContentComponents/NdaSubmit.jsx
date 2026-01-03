import React, { useRef, useState ,useEffect} from "react";
import axios from "axios";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  authState,
  apiBaseUrlState,
  showNDAAtom,
} from "../../../recoil/ctaState";

import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";
import { Message } from "primereact/message";

import SignatureCanvas from "react-signature-canvas";

const SubmitNDAForm = ({ ndaListingIdAdd, businessData }) => {
  const [agreementDate, setAgreementDate] = useState("");
  const [showNDA, setShowNDA] = useRecoilState(showNDAAtom);
  const { user, access_token } = useRecoilValue(authState) ?? {};
  const API_BASE = useRecoilValue(apiBaseUrlState);

  const sigCanvasRef = useRef(null);

  const [agreed, setAgreed] = useState(false);
  const [buyerSignature, setBuyerSignature] = useState(null);
  const [loading, setLoading] = useState(false);
  const [responseMsg, setResponseMsg] = useState(null);

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

  /* =========================
     Submit Handler
  ========================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!buyerSignature) return;

    try {
      setLoading(true);
      setResponseMsg(null);

      await axios.post(
        `${API_BASE}/nda`,
        {
          businessId: ndaListingIdAdd,
          buyerSignature: buyerSignature,
        },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );

      setResponseMsg({
        type: "success",
        text: "NDA submitted successfully!",
      });

      setTimeout(() => setShowNDA(false), 1500);
    } catch (error) {
      setResponseMsg({
        type: "error",
        text:
          error.response?.data?.message ||
          "Something went wrong while submitting NDA.",
      });
    } finally {
      setLoading(false);
    }
  };
useEffect(() => {
  if (!showNDA) return;

  const fetchServerDate = async () => {
    try {
      const res = await axios.get(
        `${API_BASE}/auth/server-datetime`,
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );

      // adjust key if your API response differs
      const serverDate = res.data?.serverDateTime || res.data?.date;

      if (serverDate) {
        const formattedDate = new Date(serverDate).toLocaleDateString(
          "en-US",
          {
            year: "numeric",
            month: "long",
            day: "numeric",
          }
        );
        setAgreementDate(formattedDate);
      }
    } catch (err) {
      console.error("Failed to fetch server date", err);
    }
  };

  fetchServerDate();
}, [showNDA, API_BASE, access_token]);

  return (
    <Dialog
      header="Mutual Non-Disclosure Agreement"
      visible={showNDA}
      modal
      onHide={() => setShowNDA(false)}
      style={{ width: "992px" }}
      className="p-fluid nda__submit_form_wrap"
    >
      <form
        onSubmit={handleSubmit}
        className="flex flex-column gap-3 nda__submit_form"
      >

<div className="nda__agreement_wrap">
      <h3>I. THE PARTIES</h3>

      <p>
        This Non-Disclosure Agreement, hereinafter known as the
        <strong> “Agreement”</strong>, created on this day{" "}
        <strong>{agreementDate}</strong>, is between{" "}
        <strong>{user.first_name} {user.last_name}</strong>, hereinafter known as{" "}
        <strong>“Party A”</strong>, and the listing owner of{" "}
        <strong>
          {businessData.businessName} (Listing ID: #{businessData._id.toString().slice(-6)})
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
        <strong>{businessData.businessState}</strong>.
      </p>

      <p className="nda__signature_note">
        By typing your name below, you acknowledge and agree to all terms and
        conditions outlined in this Agreement and provide your electronic
        signature.
      </p>
    </div>






    
        {/* =========================
           Signature
        ========================= */}
        <div className="nda__signature_wrap">
          <label className="font-medium mb-2 block">Buyer Signature</label>
          <div className="user__details_box_nda">
  
<p className="user__details_box_nda_content">
  <strong>Buyer Name:</strong> {user?.first_name || "-"} {user?.last_name || "-"}
</p>
<p className="user__details_box_nda_content">
  <strong>Date of Signature:</strong> {agreementDate}
</p>
<p className="user__details_box_nda_content">
  <strong>Buyer Name:</strong> {user?.email || "-"}
</p>

</div>
  <div className="signature__canvas">
            <SignatureCanvas
              ref={sigCanvasRef}
              penColor="black"
              canvasProps={{
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
              className="p-button-text p-button-sm signature__clear"
              onClick={clearSignature}
            />
          </div>
        

       
        </div>



   

        {/* =========================
           Response Message
        ========================= */}
        {responseMsg && (
          <Message
            severity={responseMsg.type === "error" ? "error" : "success"}
            text={responseMsg.text}
          />
        )}

       <div className="modal__buyer_nda">
         {/* =========================
           Submit
        ========================= */}
        <Button
          type="submit"
          label={loading ? "Submitting..." : "Submit NDA"}
          icon="pi pi-check"
          className="w-full mt-3"
          disabled={ !buyerSignature || loading}
        />
       </div>
      </form>
    </Dialog>
  );
};

export default SubmitNDAForm;
