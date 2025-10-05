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
                <h4>Always Free</h4>
                <p>
                  Perfect for Browsing, Submitting NDAs, and Exploring the
                  Platform
                </p>
              </div>
              <div className="ExitRampPricing__pricing_table_body_freature">
                <ul>
                  <li>
                    Buyers: Submit NDAs and Buyer Profiles, track submissions to
                    sellers, and save favorite listings
                  </li>
                  <li>
                    Sellers: Search and explore M&A experts, connect with
                    support when you need it
                  </li>
                  <li>
                    Everyone: Browse listings, access platform insights, and
                    stay updated on the latest M&A activity
                  </li>
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
                <h4>Buyer or Seller Listings</h4>
                <p>
                  Create a public listing to reach qualified buyers or sellers.
                </p>
              </div>
              <div className="ExitRampPricing__pricing_table_body_freature">
                <ul>
                  <li>Let others know you’re serious with a public listing</li>
                  <li>Keep your business and contact info confidential</li>
                  <li>Connect through secure, private messaging</li>
                </ul>
              </div>
              <div className="ExitRampPricing__pricing_table_body_price">
                $30/month/Listing
              </div>
            </div>
            <div className="ExitRampPricing__pricing_table_list">
              <div className="ExitRampPricing__pricing_table_body_type">
                <h4>Seller Central (Coming Soon)</h4>
                <p>Complete Toolkit for Sellers Managing Their Own Sale</p>
              </div>
              <div className="ExitRampPricing__pricing_table_body_freature">
                <ul>
                  <li>Includes 2-year business listing</li>
                  <li>CIM & NDA Management</li>
                  <li>Buyer analysis tools</li>
                  <li>Access to accelerators (guides)</li>
                </ul>
              </div>
              <div className="ExitRampPricing__pricing_table_body_price">
                <div>
                  <span>$60</span>
                  <em>One-time Price</em>
                </div>
              </div>
            </div>
            <div className="ExitRampPricing__pricing_table_list">
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
