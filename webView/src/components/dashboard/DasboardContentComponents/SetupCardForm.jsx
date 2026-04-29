import React, { useState } from "react";
import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";
import { Button } from "primereact/button";

const SetupCardForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setLoading(true);

    const { error } = await stripe.confirmSetup({
      elements,
      confirmParams: {
        return_url: window.location.origin + "/user/dashboard", 
      },
    });

    if (error) {
      console.error(error.message);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />

      <Button
              icon="pi pi-credit-card"
              className="save__card_new_submit_btn"
      disabled={!stripe || loading}> 
        {loading ? " Saving..." : " Save Card"}
      </Button>
    </form>
  );
};

export default SetupCardForm;