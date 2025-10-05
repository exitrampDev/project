import React, { useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { InputMask } from "primereact/inputmask";
import { Checkbox } from "primereact/checkbox";
import { Message } from "primereact/message";

const Register = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const role = state?.role || "";
  const plan = state?.plan;

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    password: "",
    confirm_password: "",
    user_type: role,
    agree: false,
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

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
      setMessage({ text: "Passwords do not match", type: "error" });
      return;
    }

    if (!formData.agree) {
      setMessage({ text: "You must agree to the terms.", type: "error" });
      return;
    }

    setLoading(true);
    setMessage({ text: "", type: "" });

    const payload = {
      ...formData,
      user_type:
        formData.user_type === "ma_expert" ? "m&a_expert" : formData.user_type,
    };

    try {
      await axios.post("http://localhost:3000/auth/register", payload);
      setMessage({ text: "Registration successful!", type: "success" });
      navigate("/login");
    } catch (error) {
      setMessage({
        text: "Registration failed. " + (error.response?.data?.message || ""),
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
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
          <label htmlFor="phone">Phone Number</label>
          <InputMask
            id="phone"
            mask="(999) 999-9999"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
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

      {message.text && (
        <div className="mt-3">
          <Message severity={message.type} text={message.text} />
        </div>
      )}
    </div>
  );
};

export default Register;
