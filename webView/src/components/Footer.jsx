import React from "react";
import { Link } from "react-router-dom";
import FooterLogo from "../assets/footerLogo.png";
import EmailIcon from "../assets/email_icon.png";
import CallIcon from "../assets/call_icon.png";
import SubscriptionForm from "./SubscriptionForm";

export default function Footer() {
  return (
    <div className="footer__content_wrap">
      <div className="footer__content_container">
        <div className="logo_block">
          <img src={FooterLogo} alt="ArrowIcon" />
          <h3>Our Commitment</h3>
          <p>
            At Exit Ramp, we believe every business deserves a strategic,
            secure, and confidential path to transition. Our mission is to
            connect the right buyers, sellers, and experts—with integrity and
            transparency.
          </p>
          <h3>Join our newsletter</h3>
          <SubscriptionForm />
        </div>
        <div className="useful_link_block">
          <h3>Useful Links</h3>
          <ul>
            <li>
              <Link to="/listings">Seller Listing</Link>
            </li>
            <li>
              <Link to="/listings">Buyer Listing</Link>
            </li>
            <li>
              <Link to="/listings">M&A Experts Listing</Link>
            </li>
            <li>
              <Link to="/aboutus">About Us</Link>
            </li>
            <li>
              <Link to="/contactus">Contact Us</Link>
            </li>
            <li>
              <Link to="/termscondition">Terms and Conditions</Link>
            </li>
            <li>
              <Link to="/privacypolicy">Privacy Policy</Link>
            </li>
          </ul>
        </div>
        <div className="content_block">
          <h3>Contact Info</h3>
          <ul>
            <li>
              <img src={EmailIcon} alt="Email Icon" />
              <a href="mailto:support@exitramp.co" className="email_contact">
                support@exitramp.co
              </a>
            </li>
            <li>
              <img src={CallIcon} alt="Call Icon" />
              <a href="tel:469-626-9379">469-626-9379</a>
            </li>
          </ul>
        </div>
      </div>
      <div className="footer__content_copyright">
        <p>© Exit Ramp 2025. All Rights Reserved.</p>
        <p>
          Built for serious business buyers, sellers, and M&A professionals.
        </p>
      </div>
    </div>
  );
}
