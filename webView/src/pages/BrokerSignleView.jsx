import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useRecoilValue } from "recoil";
import { apiBaseUrlState, authState } from "../recoil/ctaState";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Tag } from "primereact/tag";

import Header from "../components/Header";
import Footer from "../components/Footer";

const BrokerSingleView = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [broker, setBroker] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_BASE = useRecoilValue(apiBaseUrlState);
  const { access_token } = useRecoilValue(authState) ?? {};

  useEffect(() => {
    const fetchBrokerDetail = async () => {
      try {
        setLoading(true);

        const response = await axios.get(
          `${API_BASE}/users/brokers/${id}`,
          {
            headers: access_token
              ? { Authorization: `Bearer ${access_token}` }
              : {},
          }
        );

        setBroker(response.data?.data || response.data);
      } catch (error) {
        console.error("Error fetching broker details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBrokerDetail();
    }
  }, [id, API_BASE, access_token]);

  if (loading) {
    return (
      <div className="broker-loading-container">
        <h3>Loading broker profile...</h3>
      </div>
    );
  }

  if (!broker) {
    return (
      <div className="broker-loading-container">
        <h3>Broker not found.</h3>

        <Button
          label="Back to Directory"
          icon="pi pi-arrow-left"
          onClick={() => navigate(-1)}
        />
      </div>
    );
  }

  const profile = broker.profile || {};

  const fullName =
    `${broker.first_name || ""} ${broker.last_name || ""}`.trim() ||
    "Anonymous Broker";

  const businesses = Array.isArray(broker.businesses)
    ? broker.businesses
    : [];

  return (
    <>
      <Header />

      <div className="broker-detail-container">
        {/* Breadcrumbs */}
        <div className="breadcrubs__main_container">
          <Link to="/" className="breadcrumb-link">
            Home
          </Link>

          <span className="breadcrumb-separator">/</span>

          <Link
            to="/find-broker"
            className="breadcrumb-link"
          >
            Broker Directory
          </Link>

          <span className="breadcrumb-separator">/</span>

          <span className="breadcrumb-current">
            {fullName}
          </span>
        </div>

        {/* Main Layout */}
        <div className="broker-detail-grid">
          {/* Sidebar */}
          <Card className="profile-sidebar-card">
            <div className="broker-profile-header">
              {profile.brokerProfileImage ? (
                <img
                  src={profile.brokerProfileImage}
                  alt={fullName}
                  className="broker-profile-image"
                />
              ) : (
                <div className="broker-profile-placeholder">
                  {broker.first_name
                    ? broker.first_name.charAt(0).toUpperCase()
                    : "B"}
                </div>
              )}

              <h2 className="broker-profile-name">
                {fullName}
              </h2>

              <Tag
                value={
                  broker.user_type
                    ? broker.user_type
                        .replace("_", " ")
                        .toUpperCase()
                    : "BROKER"
                }
                severity="warning"
              />
            </div>

            <hr className="broker-divider" />

            <div className="broker-contact-section">
              <div className="broker-contact-row">
                <i className="pi pi-envelope broker-contact-icon" />
                <strong>Email:</strong>

                <span className="broker-contact-value">
                  {broker.email}
                </span>
              </div>

              <div className="broker-contact-row">
                <i className="pi pi-phone broker-contact-icon" />
                <strong>Phone:</strong>

                <span className="broker-contact-value">
                  {profile.phone_number ||
                    broker.phone_number ||
                    "N/A"}
                </span>
              </div>

              <div className="broker-contact-row">
                <i className="pi pi-map-marker broker-contact-icon" />
                <strong>Location:</strong>

                <span className="broker-contact-value">
                  {profile.location || "N/A"}
                  {profile.state
                    ? `, ${profile.state}`
                    : ""}
                </span>
              </div>

              {/* <div className="broker-contact-row">
                <i className="pi pi-building broker-contact-icon" />
                <strong>Company:</strong>

                <span className="broker-contact-value">
                  {profile.comany || "N/A"}
                </span>
              </div> */}

              {/* <div className="broker-contact-row">
                <i className="pi pi-users broker-contact-icon" />
                <strong>Team Size:</strong>

                <span className="broker-contact-value">
                  {profile["team members"] || "N/A"}
                </span>
              </div> */}
            </div>
          </Card>

          {/* Listings Section */}
          <div>
                    <div
                        className="broker-info-section"
                        dangerouslySetInnerHTML={{
                          __html: profile?.servicesOverview || "",
                        }}
                      />

            <h3 className="broker-listings-heading">
              Active Broker Listings ({businesses.length})
            </h3>

            {businesses.length === 0 ? (
              <p className="broker-no-listings">
                This broker currently has no active
                business listings.
              </p>
            ) : (
              <div className="broker-listings-wrapper">
                {businesses.map((business) => (
                  <Link
                    key={business._id}
                    to={`/listing/${business._id}`}
                    className="business-listing-link"
                  >
                    <div className="business-card">
                      <div className="business-card-left">
                        {business.image ? (
                          <img
                            src={business.image}
                            alt={business.listingTitle}
                            className="business-card-image"
                          />
                        ) : (
                          <div className="business-card-placeholder">
                            <i className="pi pi-image business-card-placeholder-icon" />
                          </div>
                        )}

                        <div>
                          <h4 className="business-title">
                            {business.listingTitle}
                          </h4>

                          <p className="business-location">
                            <i className="pi pi-map-marker business-location-icon" />

                            {business.businessState ||
                            business.businessCountry
                              ? `${business.businessState || ""} ${
                                  business.businessCountry || ""
                                }`
                              : "Location not specified"}
                          </p>
                        </div>
                      </div>

                      <div className="business-metrics">
                        <div>
                          <span className="metric-label">
                            Cash Flow
                          </span>

                          <strong className="metric-cashflow">
                            {business.cashFlow
                              ? `$${business.cashFlow.toLocaleString()}`
                              : "$0"}
                          </strong>
                        </div>

                        <div>
                          <span className="metric-label">
                            Asking Price
                          </span>

                          <strong className="metric-price">
                            {business.askingPrice
                              ? `$${business.askingPrice.toLocaleString()}`
                              : "Contact"}
                          </strong>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default BrokerSingleView;
