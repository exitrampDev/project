import React from "react";
import IconBlue from "../../assets/IconBlue.png";
import IconGreen from "../../assets/IconGreen.png";
import IconYelow from "../../assets/IconYelow.png";

export default function HowItWorks() {
  return (
    <div className="HowItWorks__section_wrapper">
      <div className="HowItWorks__section_container">
        <div className="HowItWorks__section_header_content">
          <h3>How It Works</h3>
          <p>Built for Confidential M&A – Not Classified Ads</p>
        </div>
        <div className="HowItWorks__section_body">
          <div className="HowItWorks__section_body_card step1">
            <div className="HowItWorks__section_body_card_step_tag">
              Step 01
            </div>
            <div className="HowItWorks__section_body_card_img">
              <img src={IconBlue} alt="-" />
            </div>
            <div className="HowItWorks__section_body_card_heading">
              Create a Free Account
            </div>
            <div className="HowItWorks__section_body_card_para">
              Buyers, Seller Data Protected And Confidential. <br></br>M&A
              Experts Profiles Are Always Public
            </div>
          </div>
          <div className="HowItWorks__section_body_card step2">
            <div className="HowItWorks__section_body_card_step_tag">
              Step 02
            </div>
            <div className="HowItWorks__section_body_card_img">
              <img src={IconGreen} alt="-" />
            </div>
            <div className="HowItWorks__section_body_card_heading">
              Browse & Inquire
            </div>
            <div className="HowItWorks__section_body_card_para">
              Access live business listings. Submit NDAs to learn more.
            </div>
          </div>
          <div className="HowItWorks__section_body_card step3">
            <div className="HowItWorks__section_body_card_step_tag">
              Step 02
            </div>
            <div className="HowItWorks__section_body_card_img">
              <img src={IconYelow} alt="-" />
            </div>
            <div className="HowItWorks__section_body_card_heading">
              Connect & Close
            </div>
            <div className="HowItWorks__section_body_card_para">
              Message sellers, review CIMs, and manage your deal process.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
