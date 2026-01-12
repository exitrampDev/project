import React, { useEffect, useState, useRef } from "react";
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
import { Toast } from "primereact/toast";

const PropertyCard = () => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [favoriteIds, setFavoriteIds] = useState([]);
  const { access_token } = useRecoilValue(authState) ?? {};
  const [allListings, setAllListings] = useState([]);
  const [listings, setListings] = useState([]);
  const API_BASE = useRecoilValue(apiBaseUrlState);
  const toast = useRef(null);
  const [page, setPage] = useState(1);
  const limit = 10;
  const [filters, setFilters] = useState({
    type: "",
    industry: "",
    state: "",
    county: "",
    askingPrice: [0, 5000000],
    annualRevenue: [0, 5000000],
    cashFlow: [0, 5000000],
    businessType: [],
  });

  // Fetch Data
 useEffect(() => {    
  fetchListing();
  }, []);

  const fetchListing = () => {
    console.log("Fetching listings with filters:", filters);
    const params = new URLSearchParams({
      page: page,
      limit: limit,
      industry: filters.industry,
      state: filters.state,
      county: filters.county,
      askingPriceMin: filters.askingPrice[0],
      askingPriceMax: filters.askingPrice[1],
      annualRevenueMin: filters.annualRevenue[0],
    });
    
    fetch(`${API_BASE}/business-listing/public?${params}`)
      .then((res) => res.json())
      .then((result) => {
        const data = Array.isArray(result.data) ? result.data : [];
        setAllListings(data);
        setListings(data);
      })
      .catch((err) => console.error(err));
  };

const saveListingBtn = (businessId) => {
 

  if (access_token) {
    // --- Save Favorite ---
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

    const data = await response.json();

    // ✅ add to local state instantly
    setFavoriteIds(prev => [...prev, businessId]);
    toast.current.show({
      severity: "success",
      summary: "Added to Favorites",
      detail: "This listing has been added to your favorites.",
      life: 3000,
    });
  } catch (error) {
    toast.current.show({
      severity: "error",
      summary: "Error",
      detail: "Failed to save favorite.",
      life: 3000,
    });
  }
};


    // --- Flag Listing ---
    const markFlag = async () => {

      const confirmFlag = window.confirm(
      "Are you sure you want to flag this listing as suspicious?"
    );

    if (!confirmFlag) return;

      try {
        const payload = {
          description: "This business is suspicious",
          businessId,
        };

        const response = await fetch(`${API_BASE}/flag`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Flag created:", data);

        toast.current.show({
          severity: "warn",
          summary: "Business Flagged",
          detail: "This business has been flagged for review.",
          life: 3000,
        });
      } catch (error) {
        console.error("Error flagging business:", error);
        toast.current.show({
          severity: "error",
          summary: "Error",
          detail: "Failed to flag this business. Please try again.",
          life: 3000,
        });
      }
    };
    const isFavorite = favoriteIds.includes(businessId);
    console.log("isFavorite>>>>>", businessId);
    return (
      <>
      <Toast ref={toast} position="top-right" />
        <Button
          icon={isFavorite ? "pi pi-heart-fill" : "pi pi-heart"}
          className={`button__save_listing_global ${isFavorite ? "active" : ""}`}
          onClick={handleSave}
        />
        <div className="flag__hit_list" onClick={markFlag}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 512 512"
            fill="#002F68"
          >
            <path d="M64 32v448h32V288h320l-96-128 96-128H64z" />
          </svg>
        </div>
      </>
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
  fetchListing();
  // let filtered = [...allListings];


  // // Industry
  // if (filters.industry) {
  //   filtered = filtered.filter((item) => {
  //     let industries = [];
  //     try {
  //       industries = JSON.parse(item.industry || "[]");
  //     } catch {}

  //     return industries.some((i) =>
  //       i.toLowerCase().includes(filters.industry.toLowerCase())
  //     );
  //   });
  // }

  // // State
  // if (filters.state) {
  //   filtered = filtered.filter(
  //     (item) =>
  //       item.businessState?.toLowerCase() === filters.state.toLowerCase()
  //   );
  // }

  // // County
  // if (filters.county) {
  //   filtered = filtered.filter(
  //     (item) =>
  //       item.businessCountry?.toLowerCase() === filters.county.toLowerCase()
  //   );
  // }

  
  // setListings(filtered);
  // setPage(1);
};

  // Reset Filters
  const clearFilters = () => {
    setFilters({
      type: "",
      industry: "",
      state: "",
      county: "",
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
useEffect(() => {
  if (!access_token) return;

  const fetchFavorites = async () => {
    try {
      const res = await fetch(`${API_BASE}/favorite`, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });

      const result = await res.json();

      // assuming result.data = [{ businessId: "..." }]
      const ids = result.data.map(fav => fav.businessId._id);
      setFavoriteIds(ids);
    } catch (err) {
      console.error("Failed to fetch favorites", err);
    }
  };

  fetchFavorites();
}, [access_token]);

  return (
    <div className="main__listing_grid">
      {/* Left Sidebar Filters */}
        <div className={`listing__filter_col_overlay ${isFilterOpen ? "open" : ""}`}
        onClick={() => setIsFilterOpen(prev => !prev)}
        ></div>
      <div className={`listing__filter_col ${isFilterOpen ? "active" : ""}`}>
        {/* Type */}
        {/* <div className="p-field">
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
        </div> */}

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

        {/* State */}
        <div className="p-field">
          <label>State</label>
          <InputText
            value={filters.state}
            onChange={(e) =>
              setFilters({ ...filters, state: e.target.value })
            }
            placeholder="State"
            style={{ width: "100%" }}
          />
        </div>

        {/* County */}
        <div className="p-field">
          <label>County</label>
          <InputText
            value={filters.county}
            onChange={(e) => setFilters({ ...filters, county: e.target.value })}
            placeholder="County"
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
        {/* <div className="p-field">
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
        </div> */}

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
        <div
            className="drag__filter_listing"
            onClick={() => setIsFilterOpen(prev => !prev)}
          >
          <i className="pi pi-filter" />

          </div>
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
                      {listing.businessCity}, {listing.businessState}
                    </p>
{/* 
                    <p>
                      <b>Type:</b> {listing.businessType} | <b>Entity:</b>{" "}
                      {listing.entityType}
                    </p> */}
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
                        {/* <b>Revenue</b>: ${listing.revenue} */}
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
