import { useEffect, useState, useRef } from "react";
import axios from "axios";
import DashboardHeader from "./DashboardHeaderBlock";
import React from "react";
import { useRecoilValue } from "recoil";
import { apiBaseUrlState, authState } from "../../../recoil/ctaState";
import StripeProvider from "./StripeProvider";
import SetupCardForm from "./SetupCardForm";

const CardSetupProcess = () => {
  const API_BASE = useRecoilValue(apiBaseUrlState);
  const { access_token } = useRecoilValue(authState) ?? {};

  const [clientSecret, setClientSecret] = useState(null);
  const hasCreatedIntent = useRef(false);

  useEffect(() => {
    if (hasCreatedIntent.current) return;
    hasCreatedIntent.current = true;

    const createSetupIntent = async () => {
      try {
        const response = await axios.get(
          `${API_BASE}/payment/card-setup-intent`,
          {
            headers: {
              Authorization: `Bearer ${access_token}`,
            },
          }
        );

        setClientSecret(response.data.clientSecret);
      } catch (err) {
        console.error("Error creating setup intent:", err);
      }
    };

    createSetupIntent();
  }, []);

  return (
    <div className="popup__card_update_block_wrap">
   <div className="dashboard__header_block">
        <h3>Add / Update Card</h3>
        
      </div>


      <div>
        <p>
          Securely save your card for future payments. No charges will be made.
        </p>

        <div className="payment__box_wrap">
          {clientSecret ? (
            <StripeProvider clientSecret={clientSecret}>
              <SetupCardForm />
            </StripeProvider>
          ) : (
            <p>Loading card form...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CardSetupProcess;