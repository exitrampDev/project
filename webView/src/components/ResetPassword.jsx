import React, { useState,useRef } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import axios from "axios";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { Message } from "primereact/message";
import { useRecoilValue } from "recoil";
import { Toast } from "primereact/toast";
import Header from "./Header";
import Footer from "./Footer";
import { authState,apiBaseUrlState  } from "../recoil/ctaState";

const ResetPassword = () => {
  const navigate = useNavigate();
const location = useLocation();
const toast = useRef(null);
const token = new URLSearchParams(location.search).get("token");
  const API_BASE = useRecoilValue(apiBaseUrlState);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setMessage("");

  if (newPassword !== confirmPassword) {
    toast.current.show({
      severity: "error",
      summary: "Password Mismatch",
      detail: "New password and confirm password must match.",
      life: 3000,
    });
    return;
  }

  setLoading(true);

  try {
    await axios.post(`${API_BASE}/auth/reset-password`, {
      newPassword,
      token,
    });

    toast.current.show({
      severity: "success",
      summary: "Success",
      detail: "Password reset successful. Redirecting to login...",
      life: 3000,
    });

    setTimeout(() => navigate("/login"), 3000);
  } catch (error) {
    toast.current.show({
      severity: "error",
      summary: "Error",
      detail:
        error.response?.data?.message ||
        "Something went wrong. Please try again.",
      life: 4000,
    });
  } finally {
    setLoading(false);
  }
};


  return (
    <>
      <Header />
       <Toast ref={toast} position="top-right" />
      <div className="reset-password-page">
        <h2>Reset Password</h2>

        <form onSubmit={handleSubmit} className="p-fluid">
          <div className="p-field mb-3">
            <label htmlFor="newPassword">New Password</label>
            <Password
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              feedback={false}
              placeholder="***********"
              toggleMask
              required
            />
          </div>

          <div className="p-field mb-3">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <Password
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              feedback={false}
              placeholder="***********"
              toggleMask
              required
            />
          </div>

          <Button
            label={loading ? "Resetting..." : "Reset Password"}
            type="submit"
            loading={loading}
            className="w-full"
          />
        </form>

        <div className="mt-3">
          {message && <Message severity="success" text={message} />}
          {error && <Message severity="error" text={error} />}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ResetPassword;
