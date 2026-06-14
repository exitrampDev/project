import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { useNavigate, useSearchParams } from "react-router-dom";
import { apiBaseUrlState, authState } from "../../../recoil/ctaState"; // Added authState import
import logo from "../../../assets/footerLogo.png";

const AcceptInviteComponent = () => {
  const API_BASE = useRecoilValue(apiBaseUrlState);
  const auth = useRecoilValue(authState);
  const setAuth = useSetRecoilState(authState);

  const access_token = auth?.access_token || localStorage.getItem("access_token");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Invite states
  const [invitationHash, setInvitationHash] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Auth View Toggle: "signup" or "login"
  const [authMode, setAuthMode] = useState("signup");

  // Form Fields State
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
  });

  // Hover states for buttons
  const [hoverAccept, setHoverAccept] = useState(false);
  const [hoverReject, setHoverReject] = useState(false);
  const [hoverSubmit, setHoverSubmit] = useState(false);

  useEffect(() => {
    const hash = searchParams.get("hash");
    if (!hash) {
      setErrorMessage("Invitation hash is missing from the URL.");
      return;
    }
    setInvitationHash(hash);
  }, [searchParams]);

  // Handle Form Inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Auth Handling (Register / Login)
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setStatusMessage("");

    try {
      let response;
      if (authMode === "signup") {
        // Sign Up Request
        response = await axios.post(`${API_BASE}/auth/register`, {
          email: formData.email,
          password: formData.password,
          first_name: formData.first_name,
          last_name: formData.last_name,
          user_type: "invited_member",
        });
        setStatusMessage("Registration successful! Logging you in...");
      } else {
        // Login Request
        response = await axios.post(`${API_BASE}/auth/login`, {
          email: formData.email,
          password: formData.password,
        });
      }

      // Extract tokens and user info from your backend structure
      const token = response.data.access_token;
      const user = response.data.data;

      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("tokenLocalStorage", token);
      if (formData.remember) {
        sessionStorage.setItem("tokenSessionStorage", token);
      }

      setAuth({ access_token: token, user });
    } catch (error) {
      console.error("Auth Error:", error);
      setErrorMessage(
        error.response?.data?.message || error.message || "Authentication failed."
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle Invitation Acceptance
  const handleAcceptInvite = async () => {
    if (!invitationHash) {
      setErrorMessage("Invitation hash is missing.");
      return;
    }

    if (!access_token) {
      setAuthMode("login");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");
      setStatusMessage("");

      await axios.post(
        `${API_BASE}/invite/accept`,
        { invitationHash },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );

      setStatusMessage("Invitation accepted successfully.");

      setTimeout(() => {
        navigate("/user/my-invited-listing");
      }, 1500);
    } catch (error) {
      console.error("Accept Invite API Error:", error);
      if (error.response?.status === 403) {
        // Clear broken session
        setAuth(null);
        localStorage.removeItem("auth");
        localStorage.removeItem("user");
        localStorage.removeItem("tokenLocalStorage");
        localStorage.removeItem("access_token");
        setAuthMode("login");
        setErrorMessage("Session expired. Please log in again.");
      } else {
        setErrorMessage(
          error.response?.data?.message || error.message || "Failed to accept invitation."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle Invitation Rejection
  const handleRejectInvite = async () => {
    if (!invitationHash) {
      setErrorMessage("Invitation hash is missing.");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");
      setStatusMessage("");

      await axios.post(
        `${API_BASE}/invite/reject`, 
        { invitationHash },
        access_token ? { headers: { Authorization: `Bearer ${access_token}` } } : {}
      );
      
      setStatusMessage("Invitation rejected.");
    } catch (error) {
      console.error("Reject Invite API Error:", error);
      setErrorMessage(
        error.response?.data?.message || error.message || "Failed to reject invitation."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logoContainer}>
          <img src={logo} alt="Logo" style={styles.logo} />
        </div>

        <h2 style={styles.title}>Invitation Request</h2>
        
        <p style={styles.text}>
          You have been invited to join. Please review the invitation key details below to accept or decline.
        </p>

        {/* <div style={styles.hashBox}>
          <span style={styles.hashLabel}>Invitation Hash:</span>
          <span style={styles.hashValue}>{invitationHash || "Not Found"}</span>
        </div> */}

        {statusMessage && <div style={styles.alertSuccess}>{statusMessage}</div>}
        {errorMessage && <div style={styles.alertDanger}>{errorMessage}</div>}

        {/* CONDITIONALLY RENDER AUTH FORM OR ACCEPT ACTIONS */}
        {!access_token ? (
          <form onSubmit={handleAuthSubmit} style={styles.form}>
            <h3 style={styles.formTitle}>
              {authMode === "signup" ? "Create an Account to Accept" : "Log In to Accept"}
            </h3>

            {authMode === "signup" && (
              <div style={styles.row}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>First Name</label>
                  <input
                    type="text"
                    name="first_name"
                    required
                    value={formData.first_name}
                    onChange={handleInputChange}
                    style={styles.input}
                    placeholder="John"
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Last Name</label>
                  <input
                    type="text"
                    name="last_name"
                    required
                    value={formData.last_name}
                    onChange={handleInputChange}
                    style={styles.input}
                    placeholder="Deo"
                  />
                </div>
              </div>
            )}

            <div style={styles.inputGroup}>
              <label style={styles.label}>Email Address</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                style={styles.input}
                placeholder="JohnDeo@gmail.com"
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Password</label>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleInputChange}
                style={styles.input}
                placeholder="••••••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !invitationHash}
              onMouseEnter={() => setHoverSubmit(true)}
              onMouseLeave={() => setHoverSubmit(false)}
              style={{
                ...styles.btnSubmit,
                ...(hoverSubmit ? styles.btnSubmitHover : {}),
                ...((loading || !invitationHash) ? styles.btnDisabled : {})
              }}
            >
              {loading ? "Processing..." : authMode === "signup" ? "Register & Continue" : "Log In & Continue"}
            </button>

            <p style={styles.toggleText}>
              {authMode === "signup" ? "Already have an account? " : "Need an account? "}
              <span
                onClick={() => setAuthMode(authMode === "signup" ? "login" : "signup")}
                style={styles.toggleLink}
              >
                {authMode === "signup" ? "Log In" : "Sign Up"}
              </span>
            </p>
          </form>
        ) : (
          /* ACTION BUTTONS DISPLAYED ONLY IF LOGGED IN */
          <div style={styles.btnGroup}>
            <button
              onClick={handleAcceptInvite}
              disabled={loading || !invitationHash}
              onMouseEnter={() => setHoverAccept(true)}
              onMouseLeave={() => setHoverAccept(false)}
              style={{
                ...styles.btnAccept,
                ...(hoverAccept ? styles.btnAcceptHover : {}),
                ...((loading || !invitationHash) ? styles.btnDisabled : {})
              }}
            >
              {loading ? "Processing..." : "Accept Invite"}
            </button>

            <button
              onClick={handleRejectInvite}
              disabled={loading || !invitationHash}
              onMouseEnter={() => setHoverReject(true)}
              onMouseLeave={() => setHoverReject(false)}
              style={{
                ...styles.btnReject,
                ...(hoverReject ? styles.btnRejectHover : {}),
                ...((loading || !invitationHash) ? styles.btnDisabled : {})
              }}
            >
              Reject
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Clean styling mapped to match your existing interface architecture
const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #001f44 0%, #002f68 100%)",
    fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    padding: "20px",
    boxSizing: "border-box",
  },
  card: {
    textAlign: "center",
    background: "#ffffff",
    padding: "40px 35px",
    borderRadius: "24px",
    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.25), 0 5px 15px rgba(0, 0, 0, 0.1)",
    maxWidth: "480px",
    width: "100%",
    boxSizing: "border-box",
  },
  logoContainer: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "20px",
  },
  logo: {
    maxWidth: "160px",
    height: "auto",
    objectFit: "contain",
  },
  title: {
    margin: "0 0 10px 0",
    fontSize: "24px",
    fontWeight: "700",
    color: "#002f68",
    letterSpacing: "-0.5px",
  },
  text: {
    color: "#64748b",
    fontSize: "14px",
    lineHeight: "1.5",
    margin: "0 0 20px 0",
  },
  hashBox: {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    padding: "12px 16px",
    marginBottom: "20px",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "4px",
    textAlign: "left",
  },
  hashLabel: {
    fontSize: "11px",
    textTransform: "uppercase",
    fontWeight: "700",
    color: "#94a3b8",
    letterSpacing: "0.5px",
  },
  hashValue: {
    fontSize: "13px",
    fontFamily: "monospace",
    color: "#334155",
    wordBreak: "break-all",
  },
  alertSuccess: {
    background: "#ecfdf5",
    color: "#047857",
    border: "1px solid #a7f3d0",
    padding: "12px",
    borderRadius: "12px",
    fontSize: "14px",
    fontWeight: "500",
    marginBottom: "20px",
  },
  alertDanger: {
    background: "#fef2f2",
    color: "#b91c1c",
    border: "1px solid #fecaca",
    padding: "12px",
    borderRadius: "12px",
    fontSize: "14px",
    fontWeight: "500",
    marginBottom: "20px",
  },
  form: {
    textAlign: "left",
    marginTop: "15px",
    borderTop: "1px solid #f1f5f9",
    paddingTop: "20px",
  },
  formTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: "15px",
    textAlign: "center",
  },
  row: {
    display: "flex",
    gap: "12px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    marginBottom: "14px",
    flex: 1,
  },
  label: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#475569",
  },
  input: {
    padding: "10px 14px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    fontSize: "14px",
    outline: "none",
    color: "#334155",
    transition: "border-color 0.2s",
  },
  toggleText: {
    fontSize: "13px",
    color: "#64748b",
    textAlign: "center",
    marginTop: "12px",
  },
  toggleLink: {
    color: "#002f68",
    fontWeight: "600",
    cursor: "pointer",
    textDecoration: "underline",
  },
  btnGroup: {
    display: "flex",
    gap: "12px",
    marginTop: "10px",
  },
  btnAccept: {
    flex: "2",
    padding: "14px 20px",
    background: "#ffb100",
    color: "#001f44",
    border: "none",
    borderRadius: "12px",
    fontWeight: "600",
    fontSize: "15px",
    cursor: "pointer",
    transition: "all 0.2s ease-in-out",
    boxShadow: "0 4px 12px rgba(255, 177, 0, 0.25)",
  },
  btnAcceptHover: {
    background: "#e09c00",
    transform: "translateY(-1px)",
    boxShadow: "0 6px 16px rgba(255, 177, 0, 0.35)",
  },
  btnSubmit: {
    width: "100%",
    padding: "12px 20px",
    background: "#002f68",
    color: "#ffffff",
    border: "none",
    borderRadius: "12px",
    fontWeight: "600",
    fontSize: "15px",
    cursor: "pointer",
    transition: "all 0.2s ease-in-out",
    marginTop: "8px",
  },
  btnSubmitHover: {
    background: "#001f44",
    transform: "translateY(-1px)",
  },
  btnReject: {
    flex: "1",
    padding: "14px 20px",
    background: "#f1f5f9",
    color: "#475569",
    border: "1px solid #cbd5e1",
    borderRadius: "12px",
    fontWeight: "600",
    fontSize: "15px",
    cursor: "pointer",
    transition: "all 0.2s ease-in-out",
  },
  btnRejectHover: {
    background: "#e2e8f0",
    color: "#1e293b",
  },
  btnDisabled: {
    opacity: "0.6",
    cursor: "not-allowed",
    transform: "none !important",
    boxShadow: "none !important",
  },
};

export default AcceptInviteComponent;