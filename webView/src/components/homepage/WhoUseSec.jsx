import React from "react";
import BuyerImg from "../../assets/buyerProfile.png";
import SellerControl from "../../assets/sellercontrolled.png";
import StandOut from "../../assets/standout.png";

export default function WhoUseSec() {
  return (
    <>
      <div className="whouse_sec_wrap_container">
        <h2 className="whouse_sec_wrap_heading">Who Uses Exit Ramp?</h2>
        <div className="whouse_sec_content_wrap">
          <div className="whouse_sec_content_first">
            <div className="whouse_sec_content_text_box">
              <h3>Curated Buyer Profiles</h3>
              <p>
                Serious sellers don’t want noise. Our buyer onboarding collects
                interests, experience, and acquisition criteria—so sellers can
                approve NDAs with confidence.
              </p>
            </div>
            <div className="whouse_sec_content_image_box">
              <img src={BuyerImg} alt="BuyerImg" />
            </div>
          </div>
          <div className="whouse_sec_content_second">
            <div className="whouse_sec_content_text_box">
              <h3>Seller-Controlled Deal Rooms</h3>
              <p>
                Share CIMs, documents, and updates only after NDA approval. You
                choose which buyers can access your materials—and revoke it at
                any time.
              </p>
            </div>
            <div className="whouse_sec_content_image_box">
              <img src={SellerControl} alt="SellerControl" />
            </div>
          </div>
          <div className="whouse_sec_content_third">
            <div className="whouse_sec_content_text_box">
              <h3>Stand Out as an M&A Expert</h3>
              <p>
                Build a public-facing profile showcasing your specialties,
                experience, & credentials. Sellers can Connect with M&A Experts
                when you're ready to close.
              </p>
            </div>
            <div className="whouse_sec_content_image_box">
              <img src={StandOut} alt="SellerControl" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
