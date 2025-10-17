import React, { useState } from "react";
import axios from "axios";
import { useRecoilState, useRecoilValue } from "recoil";
import { authState, apiBaseUrlState, showNDAAtom } from "../../../recoil/ctaState";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";
import { Message } from "primereact/message";
import { Divider } from "primereact/divider";

const SubmitNDAForm = ({ ndaListingIdAdd }) => {
  const [showNDA, setShowNDA] = useRecoilState(showNDAAtom);
  const { user, access_token } = useRecoilValue(authState) ?? {};
  const API_BASE = useRecoilValue(apiBaseUrlState);

  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [responseMsg, setResponseMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreed) return;

    try {
      setLoading(true);
      setResponseMsg(null);

      await axios.post(
        `${API_BASE}/nda`,
        { businessId: ndaListingIdAdd },
        { headers: { Authorization: `Bearer ${access_token}` } }
      );

      setResponseMsg({
        type: "success",
        text: "NDA submitted successfully!",
      });

      setTimeout(() => setShowNDA(false), 1500);
    } catch (error) {
      const msg =
        error.response?.data?.message || "Something went wrong while submitting NDA.";
      setResponseMsg({
        type: "error",
        text: msg,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      header="Submit NDA to Access CIM"
      visible={showNDA}
      style={{ width: "40vw" }}
      modal
      onHide={() => setShowNDA(false)}
      className="p-fluid nda__submit_form_wrap"
    >
      <form onSubmit={handleSubmit} className="flex flex-column gap-3 nda__submit_form">
        <p className="text-center text-color-secondary line-height-3 m-0">
          Complete the NDA below to request access to this business’s confidential materials.
        </p>



        <div className="nda__submit_form_body">
  
<div className="nda__submit_form_body_elements">
  <label>First Name</label>
  <div className="fields__content">
    {user.first_name}
  </div>
</div>
<div className="nda__submit_form_body_elements">
  <label>Last Name</label>
  <div className="fields__content">
    {user.last_name}
  </div>
</div>

<div className="nda__submit_form_body_elements">
  <label>Enmail</label>
  <div className="fields__content">
    {user.email}
  </div>
</div>

<div className="nda__submit_form_body_elements">
  <label>Phone Number</label>
  <div className="fields__content">
     {user.phone_number}
  </div>
</div>

    
  
  
 
</div>

        <div className="nda__agree_cehckbox">
          <Checkbox
            inputId="ndaAgree"
            checked={agreed}
            onChange={(e) => setAgreed(e.checked)}
          />
          <label htmlFor="ndaAgree" className="text-sm cursor-pointer">
            I agree not to disclose any confidential information.
          </label>
        </div>

        {responseMsg && (
          <Message
            severity={responseMsg.type === "error" ? "error" : "success"}
            text={responseMsg.text}
          />
        )}

        {!agreed && !responseMsg && (
          <Message
            severity="warn"
            text="Please agree to the NDA terms before submitting."
          />
        )}

        <Button
          type="submit"
          label={loading ? "Submitting..." : "Submit NDA"}
          icon="pi pi-check"
          className="w-full mt-3"
          disabled={!agreed || loading}
        />
      </form>
    </Dialog>
  );
};

export default SubmitNDAForm;
