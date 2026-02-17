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
              Start with the basics and create a free confidential profile.<br></br> 			
Buyers and Sellers keep your data Protected and Confidential. 			
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
Find your connection or create a confidential listing so everyone knows about your sale or intent to acquire.              </div>
          </div>
          <div className="HowItWorks__section_body_card step3">
            <div className="HowItWorks__section_body_card_step_tag">
              Step 03
            </div>
            <div className="HowItWorks__section_body_card_img">
              <img src={IconYelow} alt="-" />
            </div>
            <div className="HowItWorks__section_body_card_heading">
              Connect & Close
            </div>
            <div className="HowItWorks__section_body_card_para">
After finding your connection, use our market leading tools to achieve your M&A goals.             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
