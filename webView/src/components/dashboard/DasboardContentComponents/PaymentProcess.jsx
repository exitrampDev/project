import { useEffect, useState, useRef } from "react";
import axios from "axios";
import React from "react";
import { useParams } from "react-router-dom";
import { useRecoilValue } from "recoil";

import DashboardHeader from "./DashboardHeaderBlock";
import StripeProvider from "./StripeProvider";
import CheckoutForm from "./CheckoutForm";

import { apiBaseUrlState, authState } from "../../../recoil/ctaState";

const PaymentProcess = () => {
  const { id, type } = useParams(); // <-- now includes type
  const API_BASE = useRecoilValue(apiBaseUrlState);
  const { access_token } = useRecoilValue(authState) ?? {};

  const [clientSecret, setClientSecret] = useState(null);
  const [clientAmount, setClientAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const hasCreatedIntent = useRef(false);

  useEffect(() => {
    if (!id || !access_token) return;
    if (hasCreatedIntent.current) return;

    hasCreatedIntent.current = true;

    const createPaymentIntent = async () => {
      try {
        setLoading(true);

        const endpoint =
          type === "upgrade"
            ? `${API_BASE}/payment/upgrade-plan-checkout-intent`
            : `${API_BASE}/payment/inpage-checkout-intent`;

        const { data } = await axios.post(
          endpoint,
          { businessId: id },
          {
            headers: {
              Authorization: `Bearer ${access_token}`,
            },
          }
        );

        setClientSecret(data.clientSecret);
        setClientAmount(data.amount);
      } catch (err) {
        console.error("Payment intent error:", err);
        setError("Failed to initialize payment. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    createPaymentIntent();
  }, [id, type, API_BASE, access_token]);

  return (
    <>
      <DashboardHeader headingData="Complete Your Subscription" />

      <div>
        <p>
          Complete your payment securely below. We accept cards, Apple Pay,
          and Google Pay.
        </p>

        <div className="payment__box_wrap">
          <div className="payment__box_price_wrap">
            You are paying <strong>${clientAmount}</strong>
          </div>

          {loading && <p>Loading payment form...</p>}

          {error && <p className="error">{error}</p>}

          {!loading && clientSecret && (
            <StripeProvider clientSecret={clientSecret}>
              <CheckoutForm />
            </StripeProvider>
          )}
        </div>
      </div>
    </>
  );
};

export default PaymentProcess;