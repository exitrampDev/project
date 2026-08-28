import React, { useEffect, useState } from "react";
import axios from "axios";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Dropdown } from "primereact/dropdown";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { authState, apiBaseUrlState } from "../../../recoil/ctaState";
import DashboardHeaderAdmin from "./DaashboardHeaderAdmin";
import { useNavigate } from "react-router-dom";
import ResponsiveDataTable from "../../customcomponent/ResponsiveDataTable";

const AdminUserShow = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("");

  // ⬇️ CAPTCHA States
  const [captchaData, setCaptchaData] = useState({ id: "", svg: "" });
  const [captchaLoading, setCaptchaLoading] = useState(false);

  const API_BASE = useRecoilValue(apiBaseUrlState);
  const auth = useRecoilValue(authState);

  // ⬇️ Recoil setter (used for login-as-user)
  const setAuth = useSetRecoilState(authState);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    user_type: "",
    captcha_value: "",
  });

  const userTypes = [
    { label: "Admin", value: "admin" },
    { label: "Subscriber", value: "subscriber" },
    { label: "Buyer Basic", value: "buyer_basic" },
    { label: "Buyer Premium", value: "buyer_premium" },
    { label: "Seller Basic", value: "seller_basic" },
    { label: "Seller Listing", value: "seller_listing" },
    { label: "Seller Central", value: "seller_central" },
    { label: "Seller Broker", value: "seller_broker" },
    { label: "Seller Individual", value: "seller_individual" },
    { label: "M&A Expert Basic", value: "m&a_expert_basic" },
    { label: "M&A Expert Premium", value: "m&a_expert_premium" },
  ];

  // Fetch CAPTCHA logic
  const fetchCaptcha = async () => {
    setCaptchaLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/captcha`);
      const id = res.data.captchaId || res.data.captcha_id;
      setCaptchaData({
        id: id,
        svg: res.data.svg,
      });
      setFormData((prev) => ({ ...prev, captcha_value: "" }));
    } catch (error) {
      console.error("Error loading CAPTCHA:", error);
    } finally {
      setCaptchaLoading(false);
    }
  };

  // Fetch CAPTCHA when the modal opens
  useEffect(() => {
    if (visible) {
      fetchCaptcha();
    }
  }, [visible]);

  // Fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get(`${API_BASE}/users`, {
          headers: {
            Authorization: `Bearer ${auth?.access_token || ""}`,
          },
        });

        setUsers(res.data.data || []);
      } catch (err) {
        console.error("Error fetching users:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [API_BASE, auth]);

  const handleChange = (e, field) => {
    const value = e.target ? e.target.value : e.value;
    setFormData({ ...formData, [field]: value });
  };

  // Register new user
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.captcha_value) {
      setMessage("❌ Please enter the CAPTCHA.");
      return;
    }

    setLoading(true);
    setMessage("");

    const payload = {
      ...formData,
      captcha_id: captchaData.id,
      captcha_value: formData.captcha_value,
    };

    try {
      await axios.post(`${API_BASE}/auth/register`, payload, {
        headers: {
          Authorization: `Bearer ${auth?.access_token || ""}`,
        },
      });

      setMessage("✅ User registered successfully!");
      setFormData({
        email: "",
        password: "",
        first_name: "",
        last_name: "",
        user_type: "",
        captcha_value: "",
      });

      setVisible(false);
    } catch (error) {
      console.error("❌ Error creating user:", error);
      setMessage(error.response?.data?.message || "Something went wrong.");
      // Refresh CAPTCHA if submission fails
      fetchCaptcha();
    } finally {
      setLoading(false);
    }
  };

  /* ===========================
     Helpers
  ============================ */
  const formatDate = (isoDate) => {
    if (!isoDate) return "-";
    const date = new Date(isoDate);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const fullNameBody = (row) => {
    const first = row?.first_name || "";
    const last = row?.last_name || "";
    return `${first} ${last}`.trim() || "-";
  };

  /* ===========================
     LOGIN-AS-USER Handler
  ============================ */
  const loginAsUser = async (userId) => {
    try {
      const res = await axios.post(
        `${API_BASE}/auth/login-by-admin`,
        { userId },
        {
          headers: {
            Authorization: `Bearer ${auth?.access_token || ""}`,
          },
        }
      );

      const token = res.data?.access_token;
      const user = res.data?.data;
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("tokenLocalStorage", token);

      setAuth({
        access_token: token,
        user: user,
      });

      setMessage("✅ Logged in as user successfully!");

      navigate("/user/dashboard");
    } catch (error) {
      console.error("Error logging in user:", error);
      setMessage("❌ Error logging in as this user.");
    }
  };

  const loginButtonTemplate = (row) => (
    <Button
      label="Login"
      icon="pi pi-sign-in"
      className="p-button-warning p-button-sm"
      onClick={() => loginAsUser(row._id)}
    />
  );

  /* ===========================
     Table Columns Configuration
  ============================ */
  const userColumns = [
    {
      field: "fullName",
      header: "User Name",
      primary: true, // Used as the main header title in responsive card view
      body: fullNameBody,
    },
    {
      field: "first_name",
      header: "First Name",
    },
    {
      field: "last_name",
      header: "Last Name",
    },
    {
      field: "email",
      header: "Email",
    },
    {
      field: "user_type",
      header: "User Type",
    },
    {
      field: "email_verified",
      header: "Verified",
      body: (row) => (row?.email_verified ? "Yes" : "No"),
    },
    {
      field: "createdAt",
      header: "Created At",
      body: (row) => formatDate(row.createdAt),
    },
    {
      field: "actions",
      header: "Actions",
      body: loginButtonTemplate,
    },
  ];

  return (
    <>
      <DashboardHeaderAdmin headingData="Users" />

      <div className="dashboard__free_buyer_complete_profile mb-4">
        <div className="p-d-flex p-jc-between p-ai-center">
          <h2>Add New User Profile</h2>
          <p>You can register a new user role</p>
        </div>
        <Button
          label="Create New User"
          icon="pi pi-user"
          className="p-button-primary"
          onClick={() => setVisible(true)}
        />
      </div>

      {/* Responsive Table Wrapper */}
      <div className="my__save_listing_wrap my__listing_table">
        <ResponsiveDataTable
          value={users}
          columns={userColumns}
          loading={loading}
          paginator
          rows={10}
          dataKey="_id"
          emptyMessage="No users found."
          cardBreakpoint="768px"
        />
      </div>

      {/* Registration Popup Modal */}
      <Dialog
        header="Register New User"
        visible={visible}
        style={{ width: "90vw", maxWidth: "600px" }}
        modal
        onHide={() => setVisible(false)}
      >
        <form onSubmit={handleSubmit} className="admin__register_new_user_form">
          <div className="form__field_wrap">
            <label htmlFor="user_type">User Type</label>
            <Dropdown
              id="user_type"
              value={formData.user_type}
              options={userTypes}
              onChange={(e) => handleChange(e, "user_type")}
              placeholder="Select User Type"
              required
            />
          </div>

          <div className="form__field_wrap">
            <label htmlFor="first_name">First Name</label>
            <InputText
              id="first_name"
              value={formData.first_name}
              onChange={(e) => handleChange(e, "first_name")}
              required
            />
          </div>

          <div className="form__field_wrap">
            <label htmlFor="last_name">Last Name</label>
            <InputText
              id="last_name"
              value={formData.last_name}
              onChange={(e) => handleChange(e, "last_name")}
              required
            />
          </div>

          <div className="form__field_wrap">
            <label htmlFor="email">Email</label>
            <InputText
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange(e, "email")}
              required
            />
          </div>

          <div className="form__field_wrap">
            <label htmlFor="password">Password</label>
            <Password
              id="password"
              value={formData.password}
              onChange={(e) => handleChange(e, "password")}
              toggleMask
              feedback={false}
              required
            />
          </div>

          {/* CAPTCHA Section */}
          <div className="field__set field__set--captcha form__field_wrap">
            <div className="captcha__img_wrap_main">
              <label htmlFor="captcha_value">Security Verification</label>
              <div className="captcha__img_wrap flex align-items-center gap-2 mb-2">
                <div
                  className="captcha-container border-round p-2 surface-100 flex align-items-center justify-content-center"
                  dangerouslySetInnerHTML={{ __html: captchaData.svg }}
                />
                <Button
                  type="button"
                  icon="pi pi-refresh"
                  className="captcha__refresh p-button-outlined"
                  onClick={fetchCaptcha}
                  loading={captchaLoading}
                  tooltip="Refresh CAPTCHA"
                />
              </div>
              <InputText
                id="captcha_value"
                name="captcha_value"
                value={formData.captcha_value}
                onChange={(e) => handleChange(e, "captcha_value")}
                placeholder="Enter CAPTCHA code"
                required
              />
            </div>
          </div>

          <Button
            label={loading ? "Registering..." : "Register User"}
            icon="pi pi-user"
            className="p-button-success mt-3"
            type="submit"
            loading={loading}
          />

          {message && (
            <p
              className={`mt-3 ${
                message.startsWith("✅") ? "text-green-500" : "text-red-500"
              }`}
            >
              {message}
            </p>
          )}
        </form>
      </Dialog>
    </>
  );
};

export default AdminUserShow;