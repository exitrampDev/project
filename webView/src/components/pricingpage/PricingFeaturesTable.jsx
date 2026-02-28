import React from "react";

export default function PricingFeaturesTable() {
  return (
    <section className="PricingTable__wrapper">
      <div className="PricingTable__container">
        <h2>Compare Plans</h2>

        <table className="PricingTable">
          <thead>
            <tr>
              <th>Features</th>
              <th>
                Basic <br />
                <small>For Buyers</small>
              </th>
              <th>
                Standard <br />
                <small>Coming Soon</small>
              </th>
              <th>
                Premium <br />
                <small>For Brokers & Sellers</small>
              </th>
            </tr>
          </thead>

          <tbody>
            {/* Buyer Features */}
            <tr>
              <td>Saved Listing</td>
              <td><span>✔</span></td>
              <td><span>✔</span></td>
              <td><span>✔</span></td>
            </tr>
            <tr>
              <td>Previously Viewed Listings</td>
              <td><span>✔</span></td>
              <td><span>✔</span></td>
              <td><span>✔</span></td>
            </tr>
            <tr>
              <td>Confidential Profile</td>
              <td><span>✔</span></td>
              <td></td>
              <td><span>✔</span> (For Brokers)</td>
            </tr>
            <tr>
              <td>Dashboard Statistics</td>
              <td><span>✔</span></td>
              <td><span>✔</span></td>
              <td><span>✔</span></td>
            </tr>
            <tr>
              <td>View CIMs*</td>
              <td><span>✔</span></td>
              <td><span>✔</span></td>
              <td></td>
            </tr>
            <tr>
              <td>View Doc Room*</td>
              <td><span>✔</span></td>
              <td><span>✔</span></td>
              <td></td>
            </tr>
            <tr>
              <td>View Diligence List*</td>
              <td><span>✔</span></td>
              <td><span>✔</span></td>
              <td></td>
            </tr>
            <tr>
              <td>Listing Inquiries via Form</td>
              <td><span>✔</span></td>
              <td><span>✔</span></td>
              <td><span>✔</span></td>
            </tr>
            <tr>
              <td>Confidential Listing</td>
              <td></td>
              <td><span>✔</span></td>
              <td><span>✔</span></td>
            </tr>

            {/* Seller / Broker Features */}
            <tr>
              <td>Manage Listing</td>
              <td></td>
              <td><span>✔</span></td>
              <td><span>✔</span></td>
            </tr>
            <tr>
              <td>Listing Statistics</td>
              <td></td>
              <td><span>✔</span></td>
              <td><span>✔</span></td>
            </tr>
            <tr>
              <td>Add CIM</td>
              <td></td>
              <td></td>
              <td><span>✔</span></td>
            </tr>
            <tr>
              <td>Add Supporting Docs</td>
              <td></td>
              <td></td>
              <td><span>✔</span></td>
            </tr>
            <tr>
              <td>Doc Management Room</td>
              <td></td>
              <td></td>
              <td><span>✔</span></td>
            </tr>
            <tr>
              <td>Diligence List</td>
              <td></td>
              <td></td>
              <td><span>✔</span></td>
            </tr>
            <tr>
              <td>NDA Signing</td>
              <td><span>✔</span></td>
              <td></td>
              <td><span>✔</span></td>
            </tr>
            <tr>
              <td>NDA Management</td>
              <td></td>
              <td></td>
              <td><span>✔</span></td>
            </tr>
            <tr>
              <td>Buyer Profile Reviews</td>
              <td></td>
              <td></td>
              <td><span>✔</span></td>
            </tr>
            <tr>
              <td>Manage Buyer Access per Listing</td>
              <td></td>
              <td></td>
              <td><span>✔</span></td>
            </tr>
            <tr>
              <td>Add Unlimited Listings (each list at fee)</td>
              <td></td>
              <td></td>
              <td><span>✔</span></td>
            </tr>
            <tr>
              <td>Invite Team to Deal Room</td>
              <td></td>
              <td>Coming Soon!</td>
              <td></td>
            </tr>

            {/* CTA Row */}
            {/* <tr className="PricingTable__cta">
              <td></td>
              <td>
                <button>Sign Up</button>
              </td>
              <td>Coming Soon</td>
              <td>
                <button>Sign Up</button>
              </td>
            </tr> */}
          </tbody>
        </table>

        <p className="PricingTable__notes">
          * Available to Buyers currently
        </p>
      </div>
    </section>
  );
}