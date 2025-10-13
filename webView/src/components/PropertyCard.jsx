import React, { useEffect, useState } from "react";
import { InputText } from "primereact/inputtext";
import { Slider } from "primereact/slider";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { Divider } from "primereact/divider";
import { Dropdown } from "primereact/dropdown";
import { useRecoilValue } from "recoil";
import { authState,apiBaseUrlState } from "../recoil/ctaState";
import { Column } from "primereact/column";
import { Link } from "react-router-dom";

const PropertyCard = () => {
  const { access_token } = useRecoilValue(authState) ?? {};
  const [allListings, setAllListings] = useState([]);
  const [listings, setListings] = useState([]);
   const API_BASE = useRecoilValue(apiBaseUrlState);

  const [page, setPage] = useState(1);
  const limit = 25;
  const [filters, setFilters] = useState({
    type: "",
    industry: "",
    country: "",
    city: "",
    askingPrice: [0, 5000000],
    annualRevenue: [0, 5000000],
    cashFlow: [0, 5000000],
    businessType: [],
  });

  // Fetch Data
  useEffect(() => {
    fetch(`${API_BASE}/business-listing/public`)
      .then((res) => res.json())
      .then((result) => {
        const data = Array.isArray(result.data) ? result.data : [];
        setAllListings(data);
        setListings(data);
      })
      .catch((err) => console.error(err));
  }, []);

const saveListingBtn = (businessId) => {
  if (access_token) {
    const handleSave = async () => {
      try {
        const response = await fetch(`${API_BASE}/favorite`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ businessId }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Favorite saved:", data);

        // optional: update local state to reflect saved
        // setSavedIds((prev) => [...prev, businessId]);

      } catch (error) {
        console.error("Error saving favorite:", error);
      }
    };

    return (
      <Button
        icon="pi pi-heart-fill"
        className="button__save_listing_global"
        onClick={handleSave}
      />
    );
  }

  const handleNonUserClick = () => {
    const signupBtn = document.querySelector(".signup-btn");
    if (signupBtn) signupBtn.click();
  };

  return (
    <Button
      icon="pi pi-heart"
      className="button__save_listing_non_user"
      onClick={handleNonUserClick}
    />
  );
};

  // Apply Filters
  const applyFilters = () => {
    let filtered = [...allListings];

    if (filters.type) {
      filtered = filtered.filter((item) =>
        item.businessType?.toLowerCase().includes(filters.type.toLowerCase())
      );
    }

    if (filters.industry) {
      filtered = filtered.filter((item) =>
        item.industry?.some((i) =>
          i.toLowerCase().includes(filters.industry.toLowerCase())
        )
      );
    }

    if (filters.country) {
      filtered = filtered.filter(
        (item) => item.country?.toLowerCase() === filters.country.toLowerCase()
      );
    }

    if (filters.city) {
      filtered = filtered.filter(
        (item) => item.city?.toLowerCase() === filters.city.toLowerCase()
      );

      console.log("filtered>>>>>>>", filtered);
    }

    filtered = filtered.filter(
      (item) =>
        item.askingPrice >= filters.askingPrice[0] &&
        item.askingPrice <= filters.askingPrice[1]
    );

    filtered = filtered.filter(
      (item) =>
        item.revenue >= filters.annualRevenue[0] &&
        item.revenue <= filters.annualRevenue[1]
    );

    filtered = filtered.filter(
      (item) =>
        item.cashFlow >= filters.cashFlow[0] &&
        item.cashFlow <= filters.cashFlow[1]
    );

    setListings(filtered);

    setPage(1); // reset to first page when filters applied
  };

  // Reset Filters
  const clearFilters = () => {
    setFilters({
      type: "",
      industry: "",
      country: "",
      city: "",
      askingPrice: [0, 5000000],
      annualRevenue: [0, 5000000],
      cashFlow: [0, 5000000],
      businessType: [],
    });
    setListings(allListings);
    setPage(1);
  };

  // Pagination calculations
  const total = listings.length;
  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);
  const currentPageData = listings.slice(start - 1, end);

  return (
    <div className="main__listing_grid">
      {/* Left Sidebar Filters */}
      <div className="listing__filter_col">
        {/* Type */}
        <div className="p-field">
          <label>Type</label>
          <Dropdown
            value={filters.type}
            options={[
              { label: "All", value: "" },
              { label: "Sellers", value: "Sellers" },
              { label: "Buyers", value: "Buyers" },
            ]}
            onChange={(e) => setFilters({ ...filters, type: e.value })}
            placeholder="Select Type"
            style={{ width: "100%" }}
          />
        </div>

        {/* Industry */}
        <div className="p-field">
          <label>Industry</label>
          <InputText
            value={filters.industry}
            onChange={(e) =>
              setFilters({ ...filters, industry: e.target.value })
            }
            placeholder="Industry"
            style={{ width: "100%" }}
          />
        </div>

        {/* Country */}
        <div className="p-field">
          <label>Country</label>
          <InputText
            value={filters.country}
            onChange={(e) =>
              setFilters({ ...filters, country: e.target.value })
            }
            placeholder="Country"
            style={{ width: "100%" }}
          />
        </div>

        {/* City */}
        <div className="p-field">
          <label>City</label>
          <InputText
            value={filters.city}
            onChange={(e) => setFilters({ ...filters, city: e.target.value })}
            placeholder="City"
            style={{ width: "100%" }}
          />
        </div>

        {/* Asking Price */}
        <div className="p-field">
          <label>Asking Price</label>
          <Slider
            value={filters.askingPrice}
            onChange={(e) => setFilters({ ...filters, askingPrice: e.value })}
            range
            max={5000000}
          />
          <div>
            ${filters.askingPrice[0]} - ${filters.askingPrice[1]}
          </div>
        </div>

        {/* Annual Revenue */}
        <div className="p-field">
          <label>Annual Revenue</label>
          <Slider
            value={filters.annualRevenue}
            onChange={(e) => setFilters({ ...filters, annualRevenue: e.value })}
            range
            max={5000000}
          />
          <div>
            ${filters.annualRevenue[0]} - ${filters.annualRevenue[1]}
          </div>
        </div>

        {/* Cash Flow */}
        <div className="p-field">
          <label>Cash Flow</label>
          <Slider
            value={filters.cashFlow}
            onChange={(e) => setFilters({ ...filters, cashFlow: e.value })}
            range
            max={5000000}
          />
          <div>
            ${filters.cashFlow[0]} - ${filters.cashFlow[1]}
          </div>
        </div>

        {/* Buttons */}
        <Button
          label="Apply Filters"
          className="listing__filter_apply_btn"
          onClick={applyFilters}
        />
        <Button
          label="Clear All"
          className="listing__filter_clearAll_btn"
          onClick={clearFilters}
        />
      </div>

      {/* Right Listings */}
      <div className="content__listing_col">
        <h3>Sellers Listing</h3>

        {/* Showing text */}
        <div className="list__count">
          Showing {total === 0 ? 0 : start} - {end} of {total}
        </div>

        <ul className="list__ul_container">
          {currentPageData.length === 0 ? (
            <li>No listings found</li>
          ) : (
            currentPageData.map((listing) => (
              <li key={listing._id} className="list__row_item">
                <Link to={`/listing/${listing._id}`} className="flex gap-4">
                  <span className="list__image_col">
                    <img
                      alt={listing.businessName}
                      src={listing.image}
                      style={{
                        width: "100%",
                        height: "180px",
                        objectFit: "cover",
                        borderRadius: "8px",
                      }}
                    />
                  </span>
                  <span className="list_content_col">
                    <h4>{listing.businessName}</h4>
                    <p className="location__item_list">
                      {listing.city}, {listing.state}
                    </p>

                    <p>
                      <b>Type:</b> {listing.businessType} | <b>Entity:</b>{" "}
                      {listing.entityType}
                    </p>
                    <p className="list__item_industry">
                      {(() => {
                        let industries = [];
                        try {
                          industries = JSON.parse(listing.industry || "[]"); // safe parse
                        } catch (e) {
                          industries = [];
                        }

                        return (
                          <>
                            {industries.slice(0, 3).map((item, index) => (
                              <span key={index} style={{ marginRight: "6px" }}>
                                {item}
                              </span>
                            ))}

                            {industries.length > 3 && (
                              <span className="more__remains">
                                +{industries.length - 3} more
                              </span>
                            )}
                          </>
                        );
                      })()}
                    </p>

                    <div className="list__content_prices">
                      <span>
                        <b>Asking Price</b>: ${listing.askingPrice}
                      </span>
                      <span>
                        <b>Revenue</b>: ${listing.revenue}
                      </span>
                      <span>
                        <b>Cash Flow</b>: ${listing.cashFlow}
                      </span>
                    </div>
                  </span>
                </Link>

                <div className="list__actions">{saveListingBtn(listing._id)}</div>
              </li>
            ))
          )}
        </ul>

        {/* Pagination buttons */}
        <div className="listing__pagination_btn">
          <Button
            label="Prev"
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            className="p-button-secondary"
          />
          <Button
            label="Next"
            disabled={page * limit >= total}
            onClick={() => setPage((p) => (p * limit < total ? p + 1 : p))}
            className="p-button-secondary"
          />
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
