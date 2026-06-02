import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useRecoilValue } from "recoil";
import { apiBaseUrlState, authState } from "../recoil/ctaState";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Tag } from "primereact/tag";
import { Link } from "react-router-dom";
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
        // Assuming your backend endpoint matches a pattern like /users/brokers/:id or similar
        const response = await axios.get(`${API_BASE}/users/brokers/${id}`, {
          headers: access_token ? { Authorization: `Bearer ${access_token}` } : {},
        });
        
        // Adjust response path if it matches the 'response.data?.data' convention of your list layout
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
      <div style={{ padding: "40px", textAlign: "center" }}>
        <h3>Loading broker profile...</h3>
      </div>
    );
  }

  if (!broker) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <h3>Broker not found.</h3>
        <Button label="Back to Directory" icon="pi pi-arrow-left" onClick={() => navigate(-1)} />
      </div>
    );
  }

  const profile = broker.profile || {};
  const fullName = `${broker.first_name || ""} ${broker.last_name || ""}`.trim() || "Anonymous Broker";
  const businesses = Array.isArray(broker.businesses) ? broker.businesses : [];

  return (<>
  <Header/>
         <div className="broker-detail-container" style={{ paddingTop: "40px", maxWidth: "1200px", margin: "0 auto" }}>
      
     {/* Breadcrumbs Navigation */}
<div className="breadcrubs__main_container" style={{ marginBottom: "25px", fontSize: "14px", display: "flex", gap: "8px", alignItems: "center" }}>
  <Link to="/" style={{ textDecoration: "none", color: "#2563eb" }}>
    Home
  </Link>
  <span style={{ color: "#a1a1aa" }}>/</span>
  <Link to="/find-broker" style={{ textDecoration: "none", color: "#2563eb" }}>
    Broker Directory
  </Link>
  <span style={{ color: "#a1a1aa" }}>/</span>
  <span style={{ color: "#71717a", fontWeight: "500" }}>
    {fullName}
  </span>
</div>

      {/* Main Grid: Info Section & Business Listings */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "30px", alignItems: "start" }}>
        
        {/* Left Column: Profile Card */}
        <Card className="profile-sidebar-card" style={{ borderRadius: "8px", border: "1px solid #e4e4e7" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", marginBottom: "20px" }}>
            {profile.brokerProfileImage ? (
              <img 
                src={profile.brokerProfileImage} 
                alt={fullName} 
                style={{ width: "120px", height: "120px", objectFit: "cover", borderRadius: "50%", marginBottom: "15px" }} 
              />
            ) : (
              <div style={{ background: "#f4f4f5", height: "120px", width: "120px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "36px", color: "#a1a1aa", borderRadius: "50%", fontWeight: "bold", marginBottom: "15px" }}>
                {broker.first_name ? broker.first_name.charAt(0).toUpperCase() : "B"}
              </div>
            )}
            <h2 style={{ margin: "0 0 5px 0" }}>{fullName}</h2>
            <Tag value={broker.user_type ? broker.user_type.replace("_", " ").toUpperCase() : "BROKER"} severity="warning" />
          </div>

          <hr style={{ border: "0", borderTop: "1px solid #f1f5f9", margin: "20px 0" }} />

          {/* Contact Details */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "14px" }}>
            <div>
              <i className="pi pi-envelope" style={{ marginRight: "8px", color: "#64748b" }} />
              <strong>Email:</strong> <span style={{ color: "#334155" }}>{broker.email}</span>
            </div>
            <div>
              <i className="pi pi-phone" style={{ marginRight: "8px", color: "#64748b" }} />
              <strong>Phone:</strong> <span style={{ color: "#334155" }}>{profile.phone_number || broker.phone_number || "N/A"}</span>
            </div>
            <div>
              <i className="pi pi-map-marker" style={{ marginRight: "8px", color: "#64748b" }} />
              <strong>Location:</strong> <span style={{ color: "#334155" }}>{profile.location || "N/A"}{profile.state ? `, ${profile.state}` : ""}</span>
            </div>
            {/* Edge Case handling for payload keys with spaces */}
            <div>
              <i className="pi pi-building" style={{ marginRight: "8px", color: "#64748b" }} />
              <strong>Company:</strong> <span style={{ color: "#334155" }}>{profile.comany || "N/A"}</span>
            </div>
            <div>
              <i className="pi pi-users" style={{ marginRight: "8px", color: "#64748b" }} />
              <strong>Team Size:</strong> <span style={{ color: "#334155" }}>{profile["team members"] || "N/A"}</span>
            </div>
          </div>
        </Card>

        {/* Right Column: Listings Directory */}
<div>
  <h3 style={{ marginTop: 0, marginBottom: "20px" }}>Active Broker Listings ({businesses.length})</h3>
  
  {businesses.length === 0 ? (
    <p style={{ color: "#71717a", background: "#f8fafc", padding: "20px", borderRadius: "8px", border: "1px solid #f1f5f9" }}>
      This broker currently has no active business listings.
    </p>
  ) : (
    <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
      {businesses.map((business) => (
        <Link 
          key={business._id}
          to={`/listing/${business._id}`} // Dynamically maps to /listing/6a1d3a22f3782398996ac74b
          style={{ textDecoration: "none", color: "inherit", display: "block" }} // Keeps styling clean without standard blue link text
        >
          <div 
            style={{
              border: "1px solid #e4e4e7",
              borderRadius: "8px",
              padding: "20px",
              background: "#fff",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              transition: "box-shadow 0.2s ease, border-color 0.2s ease",
              cursor: "pointer"
            }}
            // Simple hover effect to show it's clickable
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#a1a1aa";
              e.currentTarget.style.boxShadow = "0 4px 6px -1px rgb(0 0 0 / 0.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#e4e4e7";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            {/* Business Details */}
            <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
              {business.image ? (
                <img src={business.image} alt={business.listingTitle} style={{ width: "60px", height: "60px", borderRadius: "4px", objectFit: "cover" }} />
              ) : (
                <div style={{ width: "60px", height: "60px", background: "#f4f4f5", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <i className="pi pi-image" style={{ color: "#a1a1aa", fontSize: "20px" }} />
                </div>
              )}
              <div>
                <h4 style={{ margin: "0 0 4px 0", fontSize: "16px", color: "#18181b" }}>{business.listingTitle}</h4>
                <p style={{ margin: 0, fontSize: "12px", color: "#71717a" }}>
                  <i className="pi pi-map-marker" style={{ fontSize: "10px", marginRight: "3px" }} />
                  {business.businessState || business.businessCountry ? `${business.businessState} ${business.businessCountry}` : "Location not specified"}
                </p>
              </div>
            </div>

            {/* Financial Metrics */}
            <div style={{ display: "flex", gap: "30px", textAlign: "right" }}>
              <div>
                <span style={{ fontSize: "11px", color: "#71717a", display: "block", textTransform: "uppercase" }}>Cash Flow</span>
                <strong style={{ color: "#16a34a" }}>
                  {business.cashFlow ? `$${business.cashFlow.toLocaleString()}` : "$0"}
                </strong>
              </div>
              <div>
                <span style={{ fontSize: "11px", color: "#71717a", display: "block", textTransform: "uppercase" }}>Asking Price</span>
                <strong style={{ color: "#2563eb", fontSize: "16px" }}>
                  {business.askingPrice ? `$${business.askingPrice.toLocaleString()}` : "Contact"}
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
<Footer/>
    </>
  );
};

export default BrokerSingleView;