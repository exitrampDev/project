import React, { useState } from "react";
import { useRecoilState } from "recoil";
import { subscribersState } from "../recoil/subscribersAtom";
import ArrowIcon from "../assets/arrowIcon.png";

const SubscriptionForm = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [subscribers, setSubscribers] = useRecoilState(subscribersState);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email || !email.includes("@")) {
      alert("Please enter a valid email address.");
      return;
    }

    // Add to Recoil state (and clear input)
    setSubscribers([...subscribers, email]);
    console.log("Subscribed:", email);
    setSubmitted(true);
    setEmail("");
  };

  return (
    <div className="subscription-container">
      <form onSubmit={handleSubmit} className="subscription-form">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">
          Subscribe <img src={ArrowIcon} alt="ArrowIcon" />
        </button>
      </form>
      {submitted && <p className="success-msg">Thanks for subscribing!</p>}
    </div>
  );
};

export default SubscriptionForm;
