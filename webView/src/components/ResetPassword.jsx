import React, { useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import axios from "axios";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { Message } from "primereact/message";

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useParams();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await axios.post("http://localhost:3000/auth/reset-password", {
        newPassword,
        token,
      });

      setMessage("Password reset successful. Redirecting...");
      setTimeout(() => navigate("/login"), 3000);
    } catch (error) {
      setError(
        error.response?.data?.message || "Something went wrong. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
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
  );
};

export default ResetPassword;
