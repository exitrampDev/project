import React, { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { apiBaseUrlState } from "../recoil/ctaState";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { InputMask } from "primereact/inputmask";
import { Checkbox } from "primereact/checkbox";
import { Toast } from "primereact/toast"; // 👈 Added Toast import
import { Dropdown } from "primereact/dropdown";
import { useRecoilValue } from "recoil";
import Header from "./Header";
import Footer from "./Footer";

const Register = () => {
  const toast = useRef(null); // 👈 Created Toast ref
  const navigate = useNavigate();
  const { state } = useLocation();
  const role = state?.role || "";
  const plan = state?.plan;
  const API_BASE = useRecoilValue(apiBaseUrlState);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirm_password: "",
    phone_number: "",
    user_type: role?.includes("seller") ? "" : role,
    agree: false,
    captcha_value: "",
  });

  const [captchaData, setCaptchaData] = useState({
    id: "",
    svg: "",
  });
  const [captchaLoading, setCaptchaLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  const isSeller = role?.includes("seller");

  // Fetch CAPTCHA on component mount
  useEffect(() => {
    fetchCaptcha();
  }, []);

  const fetchCaptcha = async () => {
    setCaptchaLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/captcha");
      const id = res.data.captchaId || res.data.captcha_id;
      setCaptchaData({
        id: id,
        svg: res.data.svg,
      });
      // Clear input on new captcha load
      setFormData((prev) => ({ ...prev, captcha_value: "" }));
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to load CAPTCHA. Please refresh.",
        life: 3000,
      });
    } finally {
      setCaptchaLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirm_password) {
      toast.current?.show({
        severity: "warn",
        summary: "Validation Warning",
        detail: "Passwords do not match.",
        life: 3000,
      });
      return;
    }

    if (!formData.agree) {
      toast.current?.show({
        severity: "warn",
        summary: "Validation Warning",
        detail: "You must agree to the terms.",
        life: 3000,
      });
      return;
    }

    if (!formData.captcha_value) {
      toast.current?.show({
        severity: "warn",
        summary: "Validation Warning",
        detail: "Please enter the CAPTCHA.",
        life: 3000,
      });
      return;
    }

    setLoading(true);

    // Destructure out confirm_password and agree before forming the payload
    const { confirm_password, agree, ...payloadData } = formData;

    const payload = {
      ...payloadData,
      user_type:
        formData.user_type === "ma_expert" ? "m&a_expert" : formData.user_type,
      captcha_id: captchaData.id,
      captcha_value: formData.captcha_value,
    };

    try {
      await axios.post(`${API_BASE}/auth/register`, payload);

      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: "Registration successful!",
        life: 3000,
      });

      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (error) {
      const errDetail =
        error.response?.data?.message || "Registration failed. Please try again.";

      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail:
          typeof errDetail === "string" ? errDetail : JSON.stringify(errDetail),
        life: 4000,
      });

      // Refresh CAPTCHA on submission error
      fetchCaptcha();
    } finally {
      setLoading(false);
    }
  };

  const sellerOptions = [
    { label: "Broker", value: "seller_broker" },
    { label: "Individual Seller", value: "seller_individual" },
  ];

  return (
    <>
      <Toast ref={toast} /> {/* 👈 Render Toast component at root level */}
      <Header />
      <div className="register-page p-4 max-w-xl mx-auto">
        <div className="text-center mb-5 register__header_block">
          <h2>Welcome to Exit Ramp</h2>
          <p>Create an account to explore listings and manage your deals.</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-fluid space-y-4 register_form_col"
        >
          <div className="field__set">
            <label htmlFor="first_name">First Name</label>
            <InputText
              id="first_name"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="field__set">
            <label htmlFor="last_name">Last Name</label>
            <InputText
              id="last_name"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="field__set">
            <label htmlFor="email">Email</label>
            <InputText
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="field__set">
            <label htmlFor="phone_number">Phone Number</label>
            <InputMask
              id="phone_number"
              mask="(999) 999-9999"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
            />
          </div>

          <div className="field__set">
            <label htmlFor="password">Password</label>
            <Password
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              toggleMask
              required
              feedback={false}
            />
          </div>

          <div className="field__set">
            <label htmlFor="confirm_password">Confirm Password</label>
            <Password
              id="confirm_password"
              name="confirm_password"
              value={formData.confirm_password}
              onChange={handleChange}
              toggleMask
              required
              feedback={false}
            />
          </div>

          {isSeller && (
            <div className="field__set">
              <label htmlFor="user_type">Seller Type</label>
              <Dropdown
                id="user_type"
                name="user_type"
                value={formData.user_type}
                options={sellerOptions}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    user_type: e.value,
                  }))
                }
                placeholder="Select Seller Type"
                className="w-full"
                required
              />
            </div>
          )}

          {/* CAPTCHA Section */}
          <div className="field__set field__set--captcha">
            <div className="captcha__img_wrap_main">
              <label htmlFor="captcha_value">Security Verification</label>
              <div className="captcha__img_wrap">
                <div
                  className="captcha-container border-round p-2 surface-100 flex align-items-center justify-content-center"
                  dangerouslySetInnerHTML={{ __html: captchaData.svg }}
                />
                <Button
                  type="button"
                  icon="pi pi-refresh"
                  className="captcha__refresh"
                  onClick={fetchCaptcha}
                  loading={captchaLoading}
                  tooltip="Refresh CAPTCHA"
                />
              </div>
              <InputText
                id="captcha_value"
                name="captcha_value"
                value={formData.captcha_value}
                onChange={handleChange}
                placeholder="Enter CAPTCHA code"
                required
              />
            </div>
          </div>

          <div className="field-checkbox">
            <Checkbox
              inputId="agree"
              name="agree"
              checked={formData.agree}
              onChange={handleChange}
            />
            <label htmlFor="agree">
              I agree to the{" "}
              <NavLink to="/termscondition">Terms of Service</NavLink> and{" "}
              <NavLink to="/privacypolicy">Privacy Policy</NavLink>
            </label>
          </div>

          <Button
            label={loading ? "Create Account..." : "Create Account"}
            type="submit"
            disabled={loading}
          />
          <div className="login_block_col">
            Already have an account? <NavLink to="/login">Sign In</NavLink>
          </div>
        </form>
      </div>
      <Footer />
    </>
  );
};

export default Register;