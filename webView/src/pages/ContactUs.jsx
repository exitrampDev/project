import React, { useState, useRef } from "react";
import ArrowIcon from "../assets/arrowIcon.png";
import axios from "axios";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useRecoilValue } from "recoil";
import { apiBaseUrlState } from "../recoil/ctaState";
import { Toast } from "primereact/toast";

export default function ContactUs() {
  const API_BASE = useRecoilValue(apiBaseUrlState);

  const toast = useRef(null);

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      first_name: formData.firstName,
      last_name: formData.lastName,
      email: formData.email,
      subject: formData.subject,
      message: formData.message,
    };

    try {
      setLoading(true);

      await axios.post(`${API_BASE}/auth/contact-us-form`, payload);

      toast.current.show({
        severity: "success",
        summary: "Success",
        detail: "Your message has been sent successfully.",
        life: 3000,
      });

      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        subject: "",
        message: "",
      });

    } catch (error) {
      const errMsg =
        error?.response?.data?.message || "Something went wrong";

      toast.current.show({
        severity: "error",
        summary: "Error",
        detail:
          typeof errMsg === "string"
            ? errMsg
            : "Failed to send message. Please try again.",
        life: 3000,
      });

      console.error("API Error:", error?.response?.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />

      <Toast ref={toast} />

      <div className="ContactUs__main_wrap">
        <div className="ContactUs__container">
          <div className="ContactUs__heading_row">
            <h3>Contact Us</h3>
            <p>
              We’re here to help. Reach out with any questions about listings,
              platform use, or partnerships.
            </p>
          </div>

          <div className="ContactUs_form_row">
            <form onSubmit={handleSubmit} className="contact__form">

              <div className="contact__form_firstName">
                <input
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  placeholder="First Name"
                />
              </div>

              <div className="contact__form_lastName">
                <input
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  placeholder="Last Name"
                />
              </div>

              <div className="contact__form_email">
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="Email Address"
                />
              </div>

              <div className="contact__form_subject">
                <input
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  placeholder="Subject"
                />
              </div>

              <div className="contact__form_message">
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  placeholder="Your Message"
                />
              </div>

              <div className="contact__form_submit_btn">
                <button type="submit" disabled={loading}>
                  {loading ? "Sending..." : "Send Message Securely"}
                  <img src={ArrowIcon} alt="ArrowIcon" />
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}