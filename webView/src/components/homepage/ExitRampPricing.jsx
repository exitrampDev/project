import React from "react";

export default function ExitRampPricing() {
  return (
    <div className="ExitRampPricing__main_wrap">
      <div className="ExitRampPricing__container">
        <div className="ExitRampPricing__header_wrap">
          <h3>Exit Ramp Pricing</h3>
          <p>Flexible options for serious buyers, sellers, and experts</p>
        </div>
        <div className="ExitRampPricing__pricing_table_wrap">
          <div className="ExitRampPricing__pricing_table_header">
            <div className="ExitRampPricing__pricing_table_header_type">
              Type
            </div>
            <div className="ExitRampPricing__pricing_table_header_freature">
              Features
            </div>
            <div className="ExitRampPricing__pricing_table_header_price">
              Price
            </div>
          </div>
          <div className="ExitRampPricing__pricing_table_body">
            <div className="ExitRampPricing__pricing_table_list">
              <div className="ExitRampPricing__pricing_table_body_type">
                <h4>Free</h4>
                <p>
                  Perfect for Browsing, Submitting NDAs, and Exploring the
                  Platform
                </p>
              </div>
              <div className="ExitRampPricing__pricing_table_body_freature">
                <ul>
                  <li>
                    For Sellers and Buyers:<span> Save Favorites | View Previous Listings | Confidential Profile | Connect with Listers</span> </li>
                  <li>
                    Buyer Extensions: <span>Submit NDAs | View CIMs  | Due Diligence List | Engage with Sellers</span> </li>
                  
                </ul>
              </div>
              <div className="ExitRampPricing__pricing_table_body_price">
                <div className="ExitRampPricing__pricing_table_body_price_free">
                  Free
                </div>
              </div>
            </div>
            <div className="ExitRampPricing__pricing_table_list">
              <div className="ExitRampPricing__pricing_table_body_type">
                <h4>Standard</h4>
                <p>
                  Create a public listing to reach qualified buyers or sellers.
                </p>
              </div>
              <div className="ExitRampPricing__pricing_table_body_freature">
                  <ul>
                  <li>
                    For Sellers:<span> Everything in Basic
Includes One Public Listing
Add More Listings for Cost
Cancel Anytime</span> </li>
                  <li>
                    Buyer: <span>Coming Soon</span> </li>
                  
                </ul>
              </div>
              <div className="ExitRampPricing__pricing_table_body_price">
                $30/month/Listing
              </div>
            </div>
            <div className="ExitRampPricing__pricing_table_list">
              <div className="ExitRampPricing__pricing_table_body_type">
                <h4>Premium </h4>
                <p>Complete Toolkit for Sellers Managing Their Own Sale</p>
              </div>
              <div className="ExitRampPricing__pricing_table_body_freature">
                 <ul>
                  <li>
                    For Sellers:<span> Everything in Standard</span> </li>
                  <li>
                    Seller Central : <span>Manage NDA Request | Analyze Buyers  | Document Room | Due Diligence List | Private Messages | Marketing Enablement | Upgrade Listings to Seller Central</span> </li>
                    <li>
                    Buyer: <span>Coming Soon</span> </li>
                </ul>
              </div>
              <div className="ExitRampPricing__pricing_table_body_price">
                <div>
                  <span>$60 / Month / Listing</span>
                </div>
              </div>
            </div>
            {/* <div className="ExitRampPricing__pricing_table_list">
              <div className="ExitRampPricing__pricing_table_body_type">
                <h4>Seller Client Services</h4>
                <p>Full-Service Support for Sellers Who Want Expert Help</p>
              </div>
              <div className="ExitRampPricing__pricing_table_body_freature">
                <ul>
                  <li>Transaction Coordinator supports</li>
                  <li>3rd Party Marketplace Postings</li>
                  <li>Buyer screening</li>
                  <li>Ongoing help</li>
                </ul>
              </div>
              <div className="ExitRampPricing__pricing_table_body_price">
                <button className="ExitRampPricing__pricing_table_body_price_schedule_call">
                  Schedule a Call
                </button>
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
}
