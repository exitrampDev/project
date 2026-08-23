import React, { useState, useEffect, useRef } from "react";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";
import { Toast } from "primereact/toast"; // 👈 Added Toast import
import { NavLink, useNavigate } from "react-router-dom";
import { useSetRecoilState, useRecoilValue } from "recoil";
import { authState, apiBaseUrlState } from "../recoil/ctaState";

import Header from "./Header";
import Footer from "./Footer";
import SignupPopup from "./SignupPopup";
import axios from "axios";

// Icons
import icon1 from "../assets/buyerIcon.png";
import icon2 from "../assets/sellerIcon.png";
import icon3 from "../assets/mnaIcon.png";
import icon4 from "../assets/subsIcon.png";
import icon5 from "../assets/freeBuyerAcc.png";
import icon6 from "../assets/paidBuyerAcc.png";
import icon7 from "../assets/freeSellerAcc.png";
import icon8 from "../assets/paidSellerAcc.png";

const accountTypes = [
  {
    icon: icon1,
    title: "I'm a Buyer",
    description: "Browse listings, submit NDAs, and connect with sellers.",
    value: "buyer",
  },
  {
    icon: icon2,
    title: "I'm a Seller",
    description: "List your business and manage interest from serious buyers.",
    value: "seller",
  },
];

const roleOptions = {
  buyer: {
    title: "Choose Buyer Plan",
    subtitle: "Select the right plan to begin your buyer journey on Exit Ramp.",
    subOptions: [
      {
        icon: icon5,
        title: "Free Buyer Account",
        description:
          "Browse listings, submit NDA requests, and save favorites — all with full confidentiality and no cost.",
        button: {
          text: "Continue with Free Account",
          link: "/register",
          roleOptionValue: "buyer_basic",
        },
      },
    ],
  },
  seller: {
    title: "Choose Seller Plan",
    subtitle:
      "Select how you’d like to list and manage your business on Exit Ramp.",
    subOptions: [
      {
        icon: icon8,
        title: "Seller Sign Up",
        description:
          "Get the toolkit: Buyer NDA Management, CIM Management, Document Management Room, Buyer Access Management, and more.",
        button: {
          text: "Upgrade to Seller Central",
          link: "/register",
          roleOptionValue: "seller_central",
        },
      },
    ],
  },
  ma_expert: {
    title: "I’m an M&A Expert",
    subtitle: "Choose your advisory service.",
    subOptions: [
      {
        icon: icon1,
        title: "Legal Advisor",
        description: "Support deal structures and compliance.",
        button: {
          text: "Continue with Free Account",
          link: "/free-buyer",
          roleOptionValue: "m&a_expert_basic",
        },
      },
      {
        icon: icon1,
        title: "Financial Advisor",
        description: "Provide valuations and funding options.",
        button: {
          text: "Continue with Free Account",
          link: "/free-buyer",
          roleOptionValue: "m&a_expert_premium",
        },
      },
    ],
  },
  subscriber: {
    title: "I’m a Subscriber",
    subtitle: "Choose your Subscriber type.",
    subOptions: [
      {
        icon: icon1,
        title: "Angel Subscriber",
        description: "Invest in early-stage companies.",
        button: {
          text: "Continue with Free Account",
          link: "/subcriber",
          roleOptionValue: "subscriber",
        },
      },
    ],
  },
};

const Login = () => {
  const toast = useRef(null); // 👈 Created Toast ref

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    captchaInput: "",
    remember: false,
  });

  const [captchaData, setCaptchaData] = useState({
    id: "",
    svg: "",
  });
  const [captchaLoading, setCaptchaLoading] = useState(false);

  const setAuth = useSetRecoilState(authState);
  const API_BASE = useRecoilValue(apiBaseUrlState);

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Popup state
  const [showPopup, setShowPopup] = useState(false);
  const [popupStep, setPopupStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState(null);

  // Fetch CAPTCHA on initial render
  useEffect(() => {
    fetchCaptcha();
  }, []);

  const fetchCaptcha = async () => {
    setCaptchaLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/captcha`);
      const id = res.data.captchaId || res.data.captcha_id;
      setCaptchaData({
        id: id,
        svg: res.data.svg,
      });
      setFormData((prev) => ({ ...prev, captchaInput: "" }));
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

  const openPopup = () => {
    setPopupStep(1);
    setSelectedRole(null);
    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
    setPopupStep(1);
    setSelectedRole(null);
  };

  const handleRoleSelect = (roleKey) => {
    if (roleKey === "ma_expert" || roleKey === "Subscriber") {
      closePopup();
      navigate("/register", { state: { role: roleKey } });
    } else {
      setSelectedRole(roleKey);
      setPopupStep(2);
    }
  };

  const handlePlanSelect = (roleKey) => {
    closePopup();
    navigate("/register", { state: { role: roleKey } });
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

    if (!formData.captchaInput) {
      toast.current?.show({
        severity: "warn",
        summary: "Validation Warning",
        detail: "Please complete the CAPTCHA.",
        life: 3000,
      });
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE}/auth/login`, {
        email: formData.email,
        password: formData.password,
        captcha_id: captchaData.id,
        captcha_value: formData.captchaInput,
      });

      const token = res.data.access_token;
      const user = res.data.data;

      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("tokenLocalStorage", token);
      if (formData.remember) {
        sessionStorage.setItem("tokenSessionStorage", token);
      }

      setAuth({ access_token: token, user });

      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: "Login successful!",
        life: 3000,
      });

      setTimeout(() => {
        navigate("/user/dashboard");
      }, 1000);
    } catch (error) {
      const errDetail =
        error.response?.data?.message || "Login failed. Please try again.";

      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: typeof errDetail === "string" ? errDetail : JSON.stringify(errDetail),
        life: 4000,
      });

      // Refresh CAPTCHA after a failed attempt
      fetchCaptcha();
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toast ref={toast} /> {/* 👈 Render Toast component at root level */}
      <Header />
      <div className="register-page">
        <div className="text-center mb-5 register__header_block">
          <h2>Welcome Back to Exit Ramp</h2>
          <p>
            Login to manage your listings, track NDAs, or explore new
            opportunities.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-fluid login__form_wrap">
          {/* Email */}
          <div className="field__set">
            <label htmlFor="email">Email Address</label>
            <InputText
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Type here..."
              required
            />
          </div>

          {/* Password */}
          <div className="field__set">
            <label htmlFor="password">Password</label>
            <Password
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              toggleMask
              feedback={false}
              placeholder="***********"
              required
            />
          </div>

          {/* CAPTCHA Section */}
          <div className="field__set">
            <label htmlFor="captchaInput">Enter Security Code</label>
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
              id="captchaInput"
              name="captchaInput"
              value={formData.captchaInput}
              onChange={handleChange}
              placeholder="Enter CAPTCHA value"
              required
            />
          </div>

          {/* Remember + Forgot */}
          <div className="login__remember_forget_pass mt-3">
            <div className="p-field-checkbox mb-3">
              <Checkbox
                inputId="remember"
                name="remember"
                checked={formData.remember}
                onChange={handleChange}
              />
              <label htmlFor="remember" className="ml-2">
                Remember me
              </label>
            </div>
            <div className="forget__passwor_main mb-2">
              <NavLink to="/forgot-password">Forgot your password?</NavLink>
            </div>
          </div>

          <Button
            type="submit"
            label={loading ? "Logging in..." : "Sign In"}
            loading={loading}
            className="mb-3"
          />
        </form>

        <div className="login_block_col register__block text-center mt-3">
          Don't have an account? <a onClick={openPopup}>Sign Up</a>
        </div>
      </div>

      <Footer />

      {/* SignupPopup */}
      {showPopup && (
        <SignupPopup
          step={popupStep}
          selectedRole={selectedRole}
          onClose={closePopup}
          onSelectRole={handleRoleSelect}
          backToStep1={() => setPopupStep(1)}
          step1Options={accountTypes}
          roleOptions={roleOptions}
          onSelectPlan={handlePlanSelect}
        />
      )}
    </>
  );
};

export default Login;