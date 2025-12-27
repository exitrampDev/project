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
              <th>Basic</th>
              <th>Standard</th>
              <th>Premium</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Save Favorites</td>
              <td>✔</td>
              <td>✔</td>
              <td>✔</td>
            </tr>
            <tr>
              <td>Previously Viewed Listings</td>
              <td>✔</td>
              <td>✔</td>
              <td>✔</td>
            </tr>
            <tr>
              <td>Confidential Profile</td>
              <td>✔</td>
              <td>✔</td>
              <td>✔</td>
            </tr>
            <tr>
              <td>Profile Connections</td>
              <td>✔</td>
              <td>✔</td>
              <td>✔</td>
            </tr>
            <tr>
              <td>View CIMs*</td>
              <td></td>
              <td>✔</td>
              <td>✔</td>
            </tr>
            <tr>
              <td>Document Room*</td>
              <td></td>
              <td></td>
              <td>✔</td>
            </tr>
            <tr>
              <td>Due Diligence List*</td>
              <td></td>
              <td>✔</td>
              <td>✔</td>
            </tr>
            <tr>
              <td>Seller Central</td>
              <td></td>
              <td></td>
              <td>✔</td>
            </tr>
            <tr>
              <td>NDA Management</td>
              <td></td>
              <td></td>
              <td>✔</td>
            </tr>
          </tbody>
        </table>

        <p className="PricingTable__notes">
          * Available to Buyers currently <br />
          ** Available to Sellers currently
        </p>
      </div>
    </section>
  );
}
