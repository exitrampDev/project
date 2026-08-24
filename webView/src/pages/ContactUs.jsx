import React, { useState, useEffect, useRef } from "react";
import ArrowIcon from "../assets/arrowIcon.png";
import axios from "axios";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useRecoilValue } from "recoil";
import { apiBaseUrlState } from "../recoil/ctaState";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";

export default function ContactUs() {
  const API_BASE = useRecoilValue(apiBaseUrlState);

  const toast = useRef(null);

  const [loading, setLoading] = useState(false);

  // ⬇️ CAPTCHA States
  const [captchaData, setCaptchaData] = useState({ id: "", svg: "" });
  const [captchaLoading, setCaptchaLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    subject: "",
    message: "",
    captcha_value: "",
  });

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
      // Clear captcha input on refresh
      setFormData((prev) => ({ ...prev, captcha_value: "" }));
    } catch (error) {
      console.error("Error loading CAPTCHA:", error);
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

  // Fetch CAPTCHA on component mount
  useEffect(() => {
    fetchCaptcha();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.captcha_value) {
      toast.current?.show({
        severity: "warn",
        summary: "Validation Warning",
        detail: "Please enter the CAPTCHA.",
        life: 3000,
      });
      return;
    }

    const payload = {
      first_name: formData.firstName,
      last_name: formData.lastName,
      email: formData.email,
      subject: formData.subject,
      message: formData.message,
      captcha_id: captchaData.id,
      captcha_value: formData.captcha_value,
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
        captcha_value: "",
      });

      // Reload fresh CAPTCHA for future submissions
      fetchCaptcha();

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
      // Refresh CAPTCHA if submission fails
      fetchCaptcha();
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

              <div className="contact__form_captcha_wrap_row">
                {/* CAPTCHA Section */}
              <div className="field__set field__set--captcha contact__form_captcha">
                <div className="captcha__img_wrap_main">
                  <label htmlFor="captcha_value">Security Verification</label>
                  <div className="captcha__img_wrap flex align-items-center gap-2 my-2">
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
                  <input
                    id="captcha_value"
                    name="captcha_value"
                    value={formData.captcha_value}
                    onChange={handleChange}
                    placeholder="Enter CAPTCHA code"
                    required
                  />
                </div>
              </div>

              <div className="contact__form_submit_btn">
                <button type="submit" disabled={loading}>
                  {loading ? "Sending..." : "Send Message Securely"}
                  <img src={ArrowIcon} alt="ArrowIcon" />
                </button>
              </div>
              </div>

            </form>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}