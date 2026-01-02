import React, { useRef, useState } from "react";
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
  console.log("businessData>>>>>>>>>>>>>>>>>>>>.",businessData);
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

    if (!agreed || !buyerSignature) return;

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

  return (
    <Dialog
      header="Submit NDA to Access CIM"
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
        <p className="text-center text-color-secondary line-height-3 m-0">
          Complete the NDA below to request access to this business’s confidential
          materials.
        </p>

        {/* =========================
           User Info (Read-only)
        ========================= */}
        <div className="nda__submit_form_body">
          <div className="nda__submit_form_body_elements">
            <label>First Name</label>
            <div className="fields__content">{user?.first_name || "-"}</div>
          </div>

          <div className="nda__submit_form_body_elements">
            <label>Last Name</label>
            <div className="fields__content">{user?.last_name || "-"}</div>
          </div>

          <div className="nda__submit_form_body_elements">
            <label>Email</label>
            <div className="fields__content">{user?.email || "-"}</div>
          </div>

          <div className="nda__submit_form_body_elements">
            <label>Phone Number</label>
            <div className="fields__content">
              {user?.phone_number || "-"}
            </div>
          </div>
        </div>

        {/* =========================
           Signature
        ========================= */}
        <div className="nda__signature_wrap">
          <label className="font-medium mb-2 block">Buyer Signature</label>

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

        {/* =========================
           NDA Agreement
        ========================= */}
        <div className="nda__agree_checkbox flex align-items-center gap-2">
          <Checkbox
            inputId="ndaAgree"
            checked={agreed}
            onChange={(e) => setAgreed(e.checked)}
          />
          <label htmlFor="ndaAgree" className="text-sm cursor-pointer">
            I agree not to disclose any confidential information.
          </label>
        </div>

        {!agreed && (
          <Message
            severity="warn"
            text="Please agree to the NDA terms before submitting."
          />
        )}

        {/* =========================
           Response Message
        ========================= */}
        {responseMsg && (
          <Message
            severity={responseMsg.type === "error" ? "error" : "success"}
            text={responseMsg.text}
          />
        )}

        {/* =========================
           Submit
        ========================= */}
        <Button
          type="submit"
          label={loading ? "Submitting..." : "Submit NDA"}
          icon="pi pi-check"
          className="w-full mt-3"
          disabled={!agreed || !buyerSignature || loading}
        />
      </form>
    </Dialog>
  );
};

export default SubmitNDAForm;
