import { useState } from "react";
import axios from "axios";
import DashboardHeader from "./DashboardHeaderBlock";
import { Button } from "primereact/button";
import React from "react";

const PaymentProcess = () => {
  const [loading, setLoading] = useState(false);

  const handlePayNow = async () => {
    try {
      setLoading(true);

      const response = await axios.post(
        "http://localhost:3000/payment/create-checkout-session",
        {
          return_url: "http://localhost:5173/user/payment-process"
        }
      );

      // Redirect to Stripe checkout page
      window.location.href = response.data.url;

    } catch (error) {
      console.error("Payment Error:", error);
      alert("An error occurred while starting the payment session.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <DashboardHeader headingData="Complete Your Subscription" />

      <div>
        <p>
          To continue accessing your dashboard features and business tools,
          please complete your payment. You will be redirected to a secure
          Stripe checkout page where you can pay safely using your preferred
          method (Credit/Debit Card, Apple Pay, Google Pay).
        </p>

        <div>
          <h3>What You Will Get:</h3>
          <ul>
            <li>Full access to your listings and document room</li>
            <li>Ability to upload and share CIMs</li>
            <li>Advanced tools for managing business deals</li>
            <li>Secure access to NDA workflows</li>
          </ul>
        </div>

        <div>
          <h3>After Payment:</h3>
          <ul>
            <li>You will be redirected back to your dashboard automatically</li>
            <li>Your premium features will be activated instantly</li>
            <li>You will receive an email confirmation</li>
          </ul>
        </div>

        {/* Pay Now Button */}

 <div className="pay__btn_listing">
    <Button
        icon="pi pi-dollar"
        className="button__save_listing_global"
        onClick={handlePayNow}
        disabled={loading}
        > 
            {loading ? "Processing..." : "Pay Now"}
    </Button>
 </div>

        
      </div>
    </>
  );
};

export default PaymentProcess;
