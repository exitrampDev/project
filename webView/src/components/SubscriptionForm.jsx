import React, { useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import axios from "axios";
import { subscribersState } from "../recoil/subscribersAtom";
import ArrowIcon from "../assets/arrowIcon.png";
import { apiBaseUrlState } from "../recoil/ctaState";



const SubscriptionForm = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [subscribers, setSubscribers] = useRecoilState(subscribersState);
  const [loading, setLoading] = useState(false);
  const API_BASE = useRecoilValue(apiBaseUrlState);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !email.includes("@")) {
      alert("Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        `${API_BASE}/auth/newsletter-subscription`,
        {
          email: email
        }
      );

      console.log("API Response:", response.data);

      // Update recoil state
      setSubscribers([...subscribers, email]);

      setSubmitted(true);
      setEmail("");

    } catch (error) {
      console.error("API Error:", error);
      alert(error?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
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

        <button type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Subscribe"}
          <img src={ArrowIcon} alt="ArrowIcon" />
        </button>
      </form>

      {submitted && (
        <p className="success-msg">Thanks for subscribing!</p>
      )}
    </div>
  );
};

export default SubscriptionForm;