import React, { useState } from "react";
import axios from "axios";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";

import Header from "./Header";
import Footer from "./Footer";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      await axios.post("http://localhost:3000/auth/send-password-reset-email", {
        email,
      });

      setMessage("If this email exists, a reset link has been sent.");
    } catch (error) {
      setMessage(
        "Error: " + (error.response?.data?.message || "Something went wrong.")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="forgot-password-page">
        <h2>Forgot Password</h2>
        <form onSubmit={handleSubmit} className="p-fluid forgot-password-form">
          <div className="field mb-3">
            <label htmlFor="email">Email</label>
            <InputText
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>

          <Button
            type="submit"
            label={loading ? "Sending..." : "Send Reset Link"}
            loading={loading}
            className="w-full"
          />
        </form>

        {message && <p className="form-message mt-3">{message}</p>}
      </div>
      <Footer />
    </>
  );
};

export default ForgotPassword;
