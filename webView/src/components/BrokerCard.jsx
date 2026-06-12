import React, { useEffect, useState } from "react";
import axios from "axios";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { Dropdown } from "primereact/dropdown";
import { useRecoilValue } from "recoil";
import {
  authState,
  apiBaseUrlState,
  usStatesState,
  industryOptionsState,
} from "../recoil/ctaState";
import { Link } from "react-router-dom";

const BrokerCard = () => {
  const [allBrokers, setAllBrokers] = useState([]);
  const [filteredBrokers, setFilteredBrokers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const API_BASE = useRecoilValue(apiBaseUrlState);
  const industryOptions = useRecoilValue(industryOptionsState);
  const { access_token } = useRecoilValue(authState) ?? {};
  const states = useRecoilValue(usStatesState);

  const [filters, setFilters] = useState({
    companyName: "",
    industry: "",
    state: "",
  });

  useEffect(() => {
    const fetchBrokers = async () => {
      try {
        setLoading(true);

        const response = await axios.get(`${API_BASE}/users/brokers`, {
          headers: access_token
            ? { Authorization: `Bearer ${access_token}` }
            : {},
          params: {
            page: 1,
            limit: 1000,
          },
        });

        const brokersArray = response.data?.data ?? [];

        setAllBrokers(brokersArray);
        setFilteredBrokers(brokersArray);
      } catch (error) {
        console.error("Error fetching brokers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBrokers();
  }, [API_BASE, access_token]);

  const applyFilters = () => {
    let result = [...allBrokers];

    const search = filters.companyName.trim().toLowerCase();

    if (search) {
      result = result.filter((broker) =>
        (broker?.profile?.businessBlocks ?? []).some((block) =>
          block?.companyName?.toLowerCase()?.includes(search)
        )
      );
    }

    if (filters.industry) {
      result = result.filter((broker) =>
        (broker?.profile?.businessBlocks ?? []).some(
          (block) =>
            (block?.industryFocus ?? "").toLowerCase() ===
            filters.industry.toLowerCase()
        )
      );
    }

    if (filters.state) {
      result = result.filter(
        (broker) =>
          (broker?.profile?.state ?? "").toLowerCase() ===
          filters.state.toLowerCase()
      );
    }

    setFilteredBrokers(result);
    setIsFilterOpen(false);
  };

  const clearFilters = () => {
    setFilters({
      companyName: "",
      industry: "",
      state: "",
    });
    setFilteredBrokers(allBrokers);
  };



  return (
    <div className="main__listing_grid">
      <div
        className={`listing__filter_col_overlay ${
          isFilterOpen ? "open" : ""
        }`}
        onClick={() => setIsFilterOpen(false)}
      />

      {/* FILTER PANEL */}
      <div className={`listing__filter_col ${isFilterOpen ? "active" : ""}`}>
        <div className="filter-field">
          <label>Company Name</label>
          <InputText
            value={filters.companyName}
            onChange={(e) =>
              setFilters({ ...filters, companyName: e.target.value })
            }
            placeholder="Search company..."
            className="full-width"
          />
        </div>

        <div className="filter-field">
          <label>Industry</label>
          <Dropdown
            value={filters.industry}
            options={industryOptions}
            placeholder="Select Industry"
            onChange={(e) =>
              setFilters({ ...filters, industry: e.value })
            }
            className="full-width"
            showClear
          />
        </div>

        <div className="filter-field">
          <label>State</label>
          <Dropdown
            value={filters.state}
            options={states}
            placeholder="Select State"
            onChange={(e) =>
              setFilters({ ...filters, state: e.value })
            }
            className="full-width"
            showClear
            filter
          />
        </div>

        <div className="filter-buttons-group">
          <Button className="filter-buttons-apply" label="Apply" onClick={applyFilters} />
          <Button className="filter-buttons-clear" label="Clear" onClick={clearFilters} />
        </div>
      </div>

      {/* LISTING */}
      <div className="content__listing_col">
        <div
          className="drag__filter_listing"
          onClick={() => setIsFilterOpen((prev) => !prev)}
        >
          <i className="pi pi-filter" />
          Filter Options
        </div>

        <h3>Broker Directory | Total: ({filteredBrokers.length})</h3>

        {loading ? (
          <p>Loading directory profiles...</p>
        ) : filteredBrokers.length === 0 ? (
          <p>No brokers found matching your criteria.</p>
        ) : (
          <ul className="list__ul_container">
            {filteredBrokers.map((broker) => {
              const profile = broker?.profile ?? {};
              const businessBlocks = profile?.businessBlocks ?? [];
              const serviceAreas = profile?.serviceAreas ?? [];

              const fullName =
                `${broker?.first_name ?? ""} ${
                  broker?.last_name ?? ""
                }`.trim() || "Anonymous Broker";

              return (
                <li key={broker._id} className="list__row_item">
                  <div className="list_content_col_listing_title">
                    {/* AVATAR */}
                    <div className="list__image_col">
                      {profile?.brokerProfileImage?.trim() ? (
                        <img
                          src={profile.brokerProfileImage}
                          alt={fullName}
                          className="broker-avatar"
                        />
                      ) : (
                        <div className="broker-avatar-placeholder">
                          {broker?.first_name?.charAt(0)?.toUpperCase() ||
                            "B"}
                        </div>
                      )}
                    </div>

                    {/* INFO */}
                    <div className="list_content_col">
                      <h4 className="broker-name">{fullName}</h4>

                      <p className="broker-contact">
                        <span>
                          <i className="pi pi-envelope" />{" "}
                          {broker?.email || "N/A"}
                        </span>
                        {" | "}
                        <span>
                          <i className="pi pi-phone" />{" "}
                          {profile?.phone_number || "N/A"}
                        </span>
                      </p>

                      <p className="broker-location">
                        <strong>Location:</strong>{" "}
                        {profile?.location || "N/A"}
                        {profile?.state ? `, ${profile.state}` : ""}
                      </p>

                      {/* BUSINESS BLOCKS */}
                      {businessBlocks.length > 0 && (
                        <div className="broker-company-card">
                          {businessBlocks.map((block, i) => (
                            <div key={i} className="broker-company-block">
                              <div>
                                Firm: <strong>{block?.companyName}</strong>
                              </div>

                              {block?.industryFocus && (
                                <div className="broker-focus-row">
                                  Focus:{" "}
                                  <Tag
                                    value={block.industryFocus
                                      .replace(/_/g, " ")
                                      .toUpperCase()}
                                    severity="info"
                                  />
                                </div>
                              )}
                              <div>
                                Established:{" "}
                                {block?.yearEstablished ? new Date(block.yearEstablished).getFullYear() : "N/A"}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* SERVICE AREAS */}
                      {serviceAreas.length > 0 && (
                          <div className="service-areas">
                            <strong>Service Areas:</strong> {" "}

                            {serviceAreas.map((a, index) => (
                              <span key={index} className="service-area-item">
                                <i className="pi pi-map-marker" />{" "}
                                {a?.county ?? ""}, {a?.state ?? ""}
                                {index !== serviceAreas.length - 1 && " | "}
                              </span>
                            ))}
                          </div>
                        )}

                      {/* DEAL SIZE */}
                      {(profile?.dealSizeMin || profile?.dealSizeMax) && (
                        <div className="deal-size">
                          <strong>Deal Size:</strong>{" "}
                          {"$"}{profile?.dealSizeMin || 0} -{" "}
                          {"$"}{profile?.dealSizeMax || 0}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* FOOTER ACTIONS */}
                  <div className="list_content_col_listing_des">
                    <Link to={`/broker/${broker._id}`} className="view-profile-link">
                      <Button
                        label="View Profile"
                        icon="pi pi-user"
                        className="view-profile-btn"
                      />
                    </Link>

                    <div>
                      <span className="active-listings-label">
                        Active Listings
                      </span>
                      <div className="active-listings-count">
                        {broker?.businessesCount ?? 0}
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