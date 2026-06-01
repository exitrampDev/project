import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { Dropdown } from "primereact/dropdown";
import { useRecoilValue, useRecoilState } from "recoil";
import { authState, apiBaseUrlState, usStatesState, usCountiesByState, selectedStateAtom, countiesState } from "../recoil/ctaState";
import { Link } from "react-router-dom";
import { useSearchParams } from "react-router-dom";

const BrokerCard = () => {
  const [allBrokers, setAllBrokers] = useState([]); // Master copy from API
  const [filteredBrokers, setFilteredBrokers] = useState([]); // What renders on screen
  const [loading, setLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  const API_BASE = useRecoilValue(apiBaseUrlState);
  const { access_token } = useRecoilValue(authState) ?? {};
  const states = useRecoilValue(usStatesState);

  // Filter States
  const [filters, setFilters] = useState({
    companyName: "",
    industry: "",
    state: ""
  });

  // 1. Fetch Brokers from Endpoint
  useEffect(() => {
    const fetchBrokers = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE}/users/brokers`, {
          headers: access_token ? { Authorization: `Bearer ${access_token}` } : {},
          params: { page: 1, limit: 1000 } // Higher limit to filter accurately client-side
        });

        const brokersArray = response.data?.data || [];
        setAllBrokers(brokersArray);
        setFilteredBrokers(brokersArray); // Initialize with full array
      } catch (error) {
        console.error("Error fetching brokers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBrokers();
  }, [API_BASE, access_token]);

  // 2. Run Functional Filtering Logic
  const applyFilters = () => {
    let result = [...allBrokers];

    // Filter by Company Name inside businessBlocks
    if (filters.companyName.trim()) {
      const searchStr = filters.companyName.toLowerCase();
      result = result.filter((broker) => {
        const blocks = broker.profile?.businessBlocks || [];
        return blocks.some((block) => 
          block.companyName?.toLowerCase().includes(searchStr)
        );
      });
    }

    // Filter by Industry Focus inside businessBlocks
    if (filters.industry) {
      result = result.filter((broker) => {
        const blocks = broker.profile?.businessBlocks || [];
        return blocks.some((block) => 
          block.industryFocus?.toLowerCase() === filters.industry.toLowerCase()
        );
      });
    }

    // Filter by Broker Profile State
    if (filters.state) {
      result = result.filter((broker) => 
        broker.profile?.state?.toLowerCase() === filters.state.toLowerCase()
      );
    }

    setFilteredBrokers(result);
    setIsFilterOpen(false); // Close overlay on mobile layout views
  };

  // 3. Reset Filters
  const clearFilters = () => {
    const reset = { companyName: "", industry: "", state: "" };
    setFilters(reset);
    setFilteredBrokers(allBrokers);
  };

  const industryOptions = [
    { label: "Technology", value: "technology" },
    { label: "Administrative and Support", value: "Administrative and Support" },
    { label: "Construction", value: "Construction" },
    { label: "Consulting", value: "Consulting" },
    { label: "Food Services and Restaurants", value: "Food Services and Restaurants" },
    { label: "Retail", value: "Retail" },
    { label: "Healthcare", value: "Health Care" }
  ];

  return (
    <div className="main__listing_grid">
      {/* Left Sidebar Overlay for mobile views */}
      <div 
        className={`listing__filter_col_overlay ${isFilterOpen ? "open" : ""}`} 
        onClick={() => setIsFilterOpen(false)}
      ></div>

      {/* Left Sidebar Filter Container */}
      <div className={`listing__filter_col ${isFilterOpen ? "active" : ""}`}>
   
        
        {/* Company Name Field */}
        <div className="p-field" style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>Company Name</label>
          <InputText
            value={filters.companyName}
            onChange={(e) => setFilters({ ...filters, companyName: e.target.value })}
            placeholder="Search Firm / Company..."
            style={{ width: "100%" }}
          />
        </div>

        {/* Industry Focus Field */}
        <div className="p-field" style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>Industry Focus</label>
          <Dropdown
            value={filters.industry}
            options={industryOptions}
            placeholder="Select Industry"
            filter
            showClear
            onChange={(e) => setFilters({ ...filters, industry: e.value })}
            style={{ width: "100%" }}
          />
        </div>

        {/* State Field */}
        <div className="p-field" style={{ marginBottom: "25px" }}>
          <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>State Location</label>
          <Dropdown
            value={filters.state}
            options={states}
            placeholder="Select State"
            filter
            showClear
            onChange={(e) => setFilters({ ...filters, state: e.value })}
            style={{ width: "100%" }}
          />
        </div>

        {/* Filter Action Buttons */}
        <div className="filter__buttons_group" style={{ display: "flex", gap: "10px" }}>
          <Button label="Apply" className="listing__filter_apply_btn p-button p-component" style={{ flex: 1 }} onClick={applyFilters} />
          <Button label="Clear" className="listing__filter_clearAll_btn p-button p-component" style={{ flex: 1 }} onClick={clearFilters} primitive="true"/>
        </div>
      </div>

      {/* Right Content Directory Stream */}
      <div className="content__listing_col">
        {/* Mobile Toggle Button */}
        <div className="drag__filter_listing" onClick={() => setIsFilterOpen(prev => !prev)}>
          <i className="pi pi-filter" style={{ marginRight: "8px" }} /> Filter Options
        </div>

        <h3>Broker Directory | Total: ({filteredBrokers.length})</h3>
        
        {loading ? (
          <p>Loading directory profiles...</p>
        ) : filteredBrokers.length === 0 ? (
          <p>No brokers found matching your criteria.</p>
        ) : (
          <ul className="list__ul_container" style={{ listStyle: "none", padding: 0 }}>
            {filteredBrokers.map((broker) => {
              const profile = broker.profile || {};
              const fullName = `${broker.first_name || ""} ${broker.last_name || ""}`.trim() || "Anonymous Broker";
              const primaryBlock = Array.isArray(profile.businessBlocks) && profile.businessBlocks.length > 0 
                ? profile.businessBlocks[0] 
                : null;

              return (
                <li 
                  key={broker._id} 
                  className="list__row_item" 
                  style={{ 
                    border: "1px solid #e4e4e7", 
                    borderRadius: "8px", 
                    padding: "20px", 
                    marginBottom: "15px",
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "20px",
                    background: "#fff"
                  }}
                >
                  {/* Left Column Avatar */}
                  <div className="list__image_col" style={{ width: "80px", flexShrink: 0 }}>
                    {profile.brokerProfileImage ? (
                      <img src={profile.brokerProfileImage} alt={fullName} style={{ width: "100%", height: "80px", objectFit: "cover", borderRadius: "50%" }} />
                    ) : (
                      <div style={{ background: "#f4f4f5", height: "80px", width: "80px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", color: "#a1a1aa", borderRadius: "50%", fontWeight: "bold" }}>
                        {broker.first_name ? broker.first_name.charAt(0).toUpperCase() : "B"}
                      </div>
                    )}
                  </div>

                  {/* Center Column Info */}
                  <div className="list_content_col" style={{ flexGrow: 1 }}>
                    <h4 style={{ margin: "0 0 6px 0", fontSize: "16px" }}>{fullName}</h4>
                    <p style={{ margin: "0 0 6px 0", fontSize: "13px", color: "#71717a" }}>
                      <span><i className="pi pi-envelope" style={{ marginRight: "4px" }} /> {broker.email}</span> | <span><i className="pi pi-phone" style={{ marginRight: "4px" }} /> {profile.phone_number ? profile.phone_number : "N/A"}</span>
                    </p>
                    <p style={{ margin: "0 0 10px 0", fontSize: "13px" }}>
                      <strong>Location:</strong> {profile.location || "N/A"}{profile.state ? `, ${profile.state}` : ""}
                    </p>

                    {primaryBlock && (
                      <div style={{ fontSize: "12px", background: "#f8fafc", padding: "8px", borderRadius: "4px", border: "1px solid #f1f5f9" }}>
                        <div>Firm: <strong>{primaryBlock.companyName}</strong></div>
                        {primaryBlock.industryFocus && (
                          <div style={{ marginTop: "4px" }}>
                            Focus: <Tag value={primaryBlock.industryFocus} severity="info" style={{ fontSize: "10px" }} />
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right Column Metric Counter */}
                  <div className="list_content_col_listing_des" style={{ textAlign: "right", minWidth: "140px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <div>
                      <Link to={`/broker/${broker._id}`} className="" style={{ textDecoration: "none",display: "flex", alignItems: "center", justifyContent: "flex-end", fontSize: "12px",}}>
                        <Button label="View Profile" className="" icon="pi pi-user"  style={{fontSize:"12px"}}/>
                      </Link>
                    </div>
                    <div>
                      <span style={{ fontSize: "12px", color: "#71717a" }}>Active Listings</span>
                      <div style={{ fontSize: "18px", fontWeight: "bold", color: "#2563eb" }}>
                        {Array.isArray(broker.businesses) ? broker.businesses.length : 0}
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default BrokerCard;