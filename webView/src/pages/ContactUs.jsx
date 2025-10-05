import React, { useState } from "react";
import ArrowIcon from "../assets/arrowIcon.png";

export default function ContactUs() {
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

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Contact form submitted:", formData);

    // You can replace this with an API call or Recoil state handling if needed
    alert("Thanks for contacting us!");
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      subject: "",
      message: "",
    });
  };
  return (
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
              <button type="submit">
                Send Message Securely <img src={ArrowIcon} alt="ArrowIcon" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
