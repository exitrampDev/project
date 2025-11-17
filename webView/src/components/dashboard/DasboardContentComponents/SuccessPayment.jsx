import { useSearchParams } from "react-router-dom";
import DashboardHeader from "./DashboardHeaderBlock";

const SuccessPayment = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");

  return (
    <>
      <DashboardHeader headingData="Payment Successful" />

      <div style={{ padding: "30px" }}>
        <p>Your payment has been completed successfully.</p>

        {sessionId && (
          <p style={{ marginTop: "15px", color: "#333" }}>
            <strong>Session ID:</strong> {sessionId}
          </p>
        )}
      </div>
    </>
  );
};

export default SuccessPayment;
