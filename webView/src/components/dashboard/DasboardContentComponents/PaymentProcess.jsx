import { useEffect, useState, useRef } from "react";
import axios from "axios";
import DashboardHeader from "./DashboardHeaderBlock";
import React from "react";
import { useParams } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { apiBaseUrlState, authState } from "../../../recoil/ctaState";
import StripeProvider from "./StripeProvider";
import CheckoutForm from "./CheckoutForm";


const PaymentProcess = () => {
  const { id } = useParams();
  const API_BASE = useRecoilValue(apiBaseUrlState);
  const { access_token } = useRecoilValue(authState) ?? {};
  const [clientSecret, setClientSecret] = useState(null);
  const hasCreatedIntent = useRef(false);

useEffect(() => {
  if (hasCreatedIntent.current) return;
  hasCreatedIntent.current = true;

  const createPaymentIntent = async () => {
    const response = await axios.post(
      `${API_BASE}/payment/inpage-checkout-intent`,
      { businessId: id },
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    setClientSecret(response.data.clientSecret);
  };

  createPaymentIntent();
}, []);

  return (
    <>
      <DashboardHeader headingData="Complete Your Subscription" />

      <div>
        <p>
          Complete your payment securely below. We accept cards, Apple Pay,
          and Google Pay.
        </p>

       <div className="payment__box_wrap">
         {clientSecret ? (
          <StripeProvider clientSecret={clientSecret}>
            <CheckoutForm />
          </StripeProvider>
        ) : (
          <p>Loading payment form...</p>
        )}
       </div>
      </div>
    </>
  );
};

export default PaymentProcess;
