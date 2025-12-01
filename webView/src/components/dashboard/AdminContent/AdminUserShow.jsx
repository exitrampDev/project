import React, { useEffect, useState } from "react";
import axios from "axios";
import { DataTable } from "primereact/datatable";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Dropdown } from "primereact/dropdown";
import { Column } from "primereact/column";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { authState, apiBaseUrlState } from "../../../recoil/ctaState";
import DashboardHeaderAdmin from "./DaashboardHeaderAdmin";
import { useNavigate } from "react-router-dom";

const AdminUserShow = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("");

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
  });

  const userTypes = [
    { label: "Admin", value: "admin" },
    { label: "Subscriber", value: "subscriber" },
    { label: "Buyer Basic", value: "buyer_basic" },
    { label: "Buyer Premium", value: "buyer_premium" },
    { label: "Seller Basic", value: "seller_basic" },
    { label: "Seller Listing", value: "seller_listing" },
    { label: "Seller Central", value: "seller_central" },
    { label: "M&A Expert Basic", value: "m&a_expert_basic" },
    { label: "M&A Expert Premium", value: "m&a_expert_premium" },
  ];

  // Fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get(`${API_BASE}/users`, {
          headers: {
            Authorization: `Bearer ${auth?.access_token || ""}`,
          },
        });

        setUsers(res.data.data);
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
    setLoading(true);
    setMessage("");

    try {
      await axios.post(`${API_BASE}/auth/register`, formData, {
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
      });

      setVisible(false);
    } catch (error) {
      console.error("❌ Error creating user:", error);
      setMessage(error.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  // Format created date
  const formatDate = (isoDate) => {
    if (!isoDate) return "-";
    const date = new Date(isoDate);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // ⬇️ LOGIN-AS-USER Using Recoil + Navigation ONLY
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

      // ⬇️ Set new auth state (NO localStorage)
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

  const loginButtonTemplate = (row) => {
    return (
      <Button
        label="Login"
        icon="pi pi-sign-in"
        className="p-button-warning p-button-sm"
        onClick={() => loginAsUser(row._id)}
      />
    );
  };

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

      {/* Table */}
      <div className="my__save_listing_wrap my__listing_table">
        <DataTable value={users} paginator rows={10} loading={loading}>
          <Column field="first_name" header="First Name" />
          <Column field="last_name" header="Last Name" />
          <Column field="email" header="Email" />
          <Column field="user_type" header="User Type" />
          <Column field="email_verified" header="Verified" />
          <Column
            field="createdAt"
            header="Created At"
            body={(row) => formatDate(row.createdAt)}
          />

          <Column header="Actions" body={loginButtonTemplate} />
        </DataTable>
      </div>

      {/* Popup */}
      <Dialog
        header="Register New User"
        visible={visible}
        style={{ width: "40vw" }}
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

          <Button
            label={loading ? "Registering..." : "Register User"}
            icon="pi pi-user"
            className="p-button-success"
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
