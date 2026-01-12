import { useSearchParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import DashboardHeader from "./DashboardHeaderBlock";

const SuccessPayment = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const navigate = useNavigate();

  useEffect(() => {
    // Remove Stripe query params from URL
    if (window.location.search) {
      navigate("/payment/success", { replace: true });
    }
  }, []);

  return (
    <>
      <DashboardHeader headingData="Payment Successful" />

      <div style={styles.container}>
        <div style={styles.invoiceBox}>
          <p style={styles.successText}>
            Your payment has been completed successfully.
          </p>

          {sessionId && (
            <div style={styles.row}>
              <span style={styles.label}>Session ID:</span>
              <span style={styles.value}>{sessionId}</span>
            </div>
          )}

          <div style={styles.divider}></div>

          <div style={styles.buttonWrapper}>
            <button
              style={{ ...styles.button, ...styles.primaryBtn }}
              onClick={() => navigate("/user/payment-history")}
            >
              View Payment History
            </button>

            <button
              style={{ ...styles.button, ...styles.secondaryBtn }}
              onClick={() => navigate("/user/my-listing")}
            >
              Go to My Listings
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default SuccessPayment;


const styles = {
  container: {
    padding: "30px",
    display: "flex",
    justifyContent: "center",
  },
  invoiceBox: {
    width: "90%",
    background: "#fff",
    padding: "30px",
    border: "1px solid #ddd",
    borderRadius: "10px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
  },
  title: {
    marginBottom: "20px",
    fontSize: "24px",
    textAlign: "center",
    fontWeight: "bold",
  },
  successText: {
    fontSize: "25px",
    marginBottom: "20px",
    color: "green",
    fontWeight: "600",
  },
  row: {
    display: "flex",
    justifyContent: "flex-start",
    gap: "15px",
    marginBottom: "12px",
  },
  label: {
    fontWeight: "600",
  },
  value: {
    fontWeight: "400",
  },
  divider: {
    height: "1px",
    background: "#eee",
    margin: "20px 0",
  },
  buttonWrapper: {
    display: "flex",
    justifyContent: "space-between",
    gap: "15px",
    marginTop: "10px",
  },
  button: {
    width: "100%",
    padding: "12px 0",
    borderRadius: "8px",
    fontSize: "15px",
    cursor: "pointer",
    fontWeight: "600",
    border: "none",
  },
  primaryBtn: {
    background: "#0d6efd",
    color: "#fff",
  },
  secondaryBtn: {
    background: "#6c757d",
    color: "#fff",
  },
};
