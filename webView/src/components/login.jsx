import React, { useState } from "react";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";
import { NavLink, useNavigate } from "react-router-dom";
import { useSetRecoilState } from "recoil";
import { authState } from "../recoil/ctaState";

import Header from "./Header";
import Footer from "./Footer";
import SignupPopup from "./SignupPopup"; // 👈 Import your popup
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
  {
    icon: icon3,
    title: "I'm an M&A Expert",
    description: "Showcase your expertise and help sellers close strong deals.",
    value: "ma_expert",
  },
  {
    icon: icon4,
    title: "I Just Want Updates",
    description: "Sign up for insights and M&A market news.",
    value: "subscriber",
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
        },
      },
      {
        icon: icon6,
        title: "Premium Buyer Account",
        description:
          "Get direct access to sellers, unlock CIMs after NDA approval, and use advanced tools built for buyers.",
        button: {
          text: "Upgrade to Premium Buyer",
          link: "/register",
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
        icon: icon7,
        title: "Free Seller Account",
        description:
          "List your business, manage NDA requests, and message buyers privately — all while keeping your identity protected.",
        button: {
          text: "Continue with Free Account",
          link: "/register",
        },
      },
      {
        icon: icon8,
        title: "Seller Central Account (Premium)",
        description:
          "Get the full toolkit: NDA and CIM management, 2-year listing, buyer insights, and expert selling resources.",
        button: {
          text: "Upgrade to Seller Central",
          link: "/register",
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
        },
      },
      {
        icon: icon1,
        title: "Financial Advisor",
        description: "Provide valuations and funding options.",
        button: {
          text: "Continue with Free Account",
          link: "/free-buyer",
        },
      },
    ],
  },
  Subscriber: {
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
        },
      },
      {
        icon: icon1,
        title: "VC Firm",
        description: "Find scalable investment opportunities.",
        button: {
          text: "Continue with Free Account",
          link: "/subcriber",
        },
      },
    ],
  },
};
const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false,
  });
  const setAuth = useSetRecoilState(authState);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // 🔹 Popup state (copied from Header)
  const [showPopup, setShowPopup] = useState(false);
  const [popupStep, setPopupStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState(null);

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

  // 🔹 Login form
  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:3000/auth/login", {
        email: formData.email,
        password: formData.password,
      });
      const token = res.data.access_token;
      const user = res.data.data;

      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("tokenLocalStorage", token);
      if (formData.remember) {
        sessionStorage.setItem("tokenSessionStorage", token);
      }

      setAuth({ access_token: token, user });
      setMessage("Login successful!");
      navigate("/user/dashboard");
    } catch (error) {
      setMessage(
        "Login failed. " +
          (error.response?.data?.message || "Please try again.")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
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

          {/* Remember + Forgot */}
          <div className="login__remember_forget_pass">
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

        {message && <p className="form-message">{message}</p>}
        <div className="login_block_col register__block">
          Don't have an account? <a onClick={openPopup}>Sign Up</a>
        </div>
      </div>

      <Footer />

      {/* 🔹 SignupPopup */}
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
