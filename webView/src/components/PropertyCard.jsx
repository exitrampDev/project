import React, { useEffect, useState, useRef } from "react";
import { InputText } from "primereact/inputtext";
import { Slider } from "primereact/slider";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { Divider } from "primereact/divider";
import { Dropdown } from "primereact/dropdown";
import { useRecoilValue,useRecoilState } from "recoil";
import { authState,apiBaseUrlState, usStatesState,
  usCountiesByState,
  selectedStateAtom,
  countiesState } from "../recoil/ctaState";
import { Column } from "primereact/column";
import { Link } from "react-router-dom";
import { Toast } from "primereact/toast";
import { useSearchParams } from "react-router-dom";

const PropertyCard = () => {
    const [refreshKey, setRefreshKey] = useState(0);
   const [searchParams, setSearchParams] = useSearchParams();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
const states = useRecoilValue(usStatesState);
const [selectedState, setSelectedState] = useRecoilState(selectedStateAtom);
const [counties, setCounties] = useRecoilState(countiesState);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const { access_token } = useRecoilValue(authState) ?? {};
  const [allListings, setAllListings] = useState([]);
  const [listings, setListings] = useState([]);
  const API_BASE = useRecoilValue(apiBaseUrlState);
  const toast = useRef(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(1);
  const limit = 10;
  const [filters, setFilters] = useState({
    type: "",
    industry: searchParams.get("industry") || "",
    state: searchParams.get("state") || "",
    county: searchParams.get("county") || "",
    askingPrice: [0, 5000000],
    annualRevenue: [0, 5000000],
    cashFlow: [0, 5000000],
    businessType: [],
  });

  // Fetch Data
 useEffect(() => {    
  fetchListing();
 
  }, [page, refreshKey]);

  useEffect(() => {
    setSearchParams(serializeFiltersToParams(filters), { replace: true });


  }, [filters, setSearchParams]);


  
  useEffect(() => {
   
    if(filters.state){
      setCounties(usCountiesByState[filters.state] || []);
      setFilters({...filters, county: searchParams.get("county") || ""});

    }

             
  }, [filters.state]);

  const serializeFiltersToParams = (filters) => {
    const params = {};

    Object.entries(filters).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        if (value.length) params[key] = value.join(",");
      } else if (value) {
        params[key] = value;
      }
    });

    return params;
  };


  // Fetch Data
 useEffect(() => {    
  fetchListing();
  }, [page]);

  const fetchListing = () => {
    console.log("Fetching listings with filters:", filters);
    const params = new URLSearchParams(
      Object.entries({
        page,
        limit,
        industry: filters.industry,
        state: filters.state,
        county: filters.county,
        askingPriceMin: filters.askingPrice?.[0],
        askingPriceMax: filters.askingPrice?.[1],
        annualRevenueMin: filters.annualRevenue?.[0],
        annualRevenueMax: filters.annualRevenue?.[1],
      }).reduce((acc, [k, v]) => {
        if (v !== undefined && v !== null && v !== "") acc[k] = v;
        return acc;
      }, {})
    );

    
    fetch(`${API_BASE}/business-listing/public?${params}`)
      .then((res) => res.json())
      .then((result) => {
        const data = Array.isArray(result.data) ? result.data : [];
        setAllListings(data);
        setListings(data);
        setTotal(result.total);
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
    // console.log("isFavorite>>>>>", businessId);
    return (
      <>
      <Toast ref={toast} position="top-right" />
        <Button
          icon={isFavorite ? "pi pi-heart-fill" : "pi pi-heart"}
          className={`button__save_listing_global ${isFavorite ? "active" : ""}`}
          onClick={ isFavorite ? "" : handleSave}
        />
       
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
  const industryOptions = [
  { label: "Administrative and Support", value: "Administrative and Support" },
  { label: "Agriculture, Farming, Forestry", value: "Agriculture, Farming, Forestry" },
  { label: "Entertainment and Recreation", value: "Entertainment and Recreation" },
  { label: "Arts and Entertainment", value: "Arts and Entertainment" },
  { label: "Automotive, RV, Boat", value: "Automotive, RV, Boat" },
  { label: "Beauty and Personal Care", value: "Beauty and Personal Care" },
  { label: "Building Material and Supplies", value: "Building Material and Supplies" },
  { label: "Computer and Electronic", value: "Computer and Electronic" },
  { label: "Construction", value: "Construction" },
  { label: "Consulting", value: "Consulting" },
  { label: "Contracting Services", value: "Contracting Services" },
  { label: "Delivery Services", value: "Delivery Services" },
  { label: "Education and Children", value: "Education and Children" },
  { label: "Electrical and Appliance", value: "Electrical and Appliance" },
  { label: "Financial Services", value: "Financial Services" },
  { label: "Fitness", value: "Fitness" },
  { label: "Food Services and Restaurants", value: "Food Services and Restaurants" },
  { label: "Gas Stations", value: "Gas Stations" },
  { label: "Health Care", value: "Health Care" },
  { label: "Hotel and Accommodations", value: "Hotel and Accommodations" },
  { label: "Waste Management", value: "Waste Management" },
  { label: "Wholesale and Distribution", value: "Wholesale and Distribution" },
  { label: "Daycare", value: "Daycare" },
  { label: "Information Technology", value: "Information Technology" },
  { label: "Insurance", value: "Insurance" },
  { label: "Manufacturing", value: "Manufacturing" },
  { label: "Mining and Quarrying", value: "Mining and Quarrying" },
  { label: "Oil and Gas", value: "Oil and Gas" },
  { label: "Other Non-Categorized", value: "Other Non-Categorized" },
  { label: "Personal Care", value: "Personal Care" },
  { label: "Pet Services", value: "Pet Services" },
  { label: "Printing", value: "Printing" },
  { label: "Real Estate", value: "Real Estate" },
  { label: "Religious", value: "Religious" },
  { label: "Retail", value: "Retail" },
  { label: "Home Services", value: "Home Services" },
  { label: "Storage", value: "Storage" },
  { label: "Telecommunication", value: "Telecommunication" },
  { label: "Transportation", value: "Transportation" },
  { label: "Travel", value: "Travel" },
  { label: "Advertising and Marketing", value: "Advertising and Marketing" },
  { label: "Sanitation and Cleaning", value: "Sanitation and Cleaning" },
];
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
    // setListings(allListings);
    // setPage(1);
    setRefreshKey(prev => prev + 1);
  };

  // Pagination calculations
  // const total = listings.length;
  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);
  const currentPageData = listings;
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


 <Dropdown
  value={filters.industry}
  options={industryOptions}
  placeholder="Select Industry"
  filter
  showClear
   onChange={(e) =>
              setFilters({ ...filters, industry: e.target.value })
            }
/>

{/* 
          <InputText
            value={filters.industry}
            onChange={(e) =>
              setFilters({ ...filters, industry: e.target.value })
            }
            placeholder="Industry"
            style={{ width: "100%" }}
          /> */}
        </div>

        {/* State */}
        <div className="p-field">
          <label>State</label>
          <Dropdown
            value={filters.state}
            options={states}
            placeholder="Select State"
            filter
            showClear
            onChange={(e) => {
              setSelectedState(e.value);
              setCounties(usCountiesByState[e.value] || []);
              setFilters({
                ...filters,
                state: e.value,
                county: ""
              });
            }}
            style={{ width: "100%" }}
          />
        </div>

        {/* County */}
        <div className="p-field">
          <label>County</label>
          <Dropdown
                value={filters.county}
                options={counties}
                placeholder="Select County"
                disabled={!filters.state}
                filter
                showClear
                onChange={(e) =>
                  setFilters({ ...filters, county: e.value })
                }
                style={{ width: "100%" }}
              />
        </div>

        {/* Asking Price */}
<div className="p-field value__range_field">
  <label>Asking Price</label>

  <div className="range__inputs">
    <InputText
      type="number"
      placeholder="Min"
      value={filters.askingPrice[0]}
      onChange={(e) =>
        setFilters({
          ...filters,
          askingPrice: [
            Number(e.target.value || 0),
            filters.askingPrice[1],
          ],
        })
      }
    />

    <span className="range__separator">–</span>

    <InputText
      type="number"
      placeholder="Max"
      value={filters.askingPrice[1]}
      onChange={(e) =>
        setFilters({
          ...filters,
          askingPrice: [
            filters.askingPrice[0],
            Number(e.target.value || 0),
          ],
        })
      }
    />
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
       <div className="p-field value__range_field">
  <label>Cash Flow</label>

  <div className="range__inputs">
    <InputText
      type="number"
      placeholder="Min"
      value={filters.cashFlow[0]}
      onChange={(e) =>
        setFilters({
          ...filters,
          cashFlow: [
            Number(e.target.value || 0),
            filters.cashFlow[1],
          ],
        })
      }
    />

    <span className="range__separator">–</span>

    <InputText
      type="number"
      placeholder="Max"
      value={filters.cashFlow[1]}
      onChange={(e) =>
        setFilters({
          ...filters,
          cashFlow: [
            filters.cashFlow[0],
            Number(e.target.value || 0),
          ],
        })
      }
    />
  </div>
</div>


        {/* Buttons */}
      <div className="filter__buttons_group">
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
          Showing { currentPageData.length} of {total}
        </div>

        <ul className="list__ul_container">
          {currentPageData.length === 0 ? (
            <li>No listings found</li>
          ) : (
            currentPageData.map((listing) => (
              <li key={listing._id} className="list__row_item">
                <span className="listing__info_left_content">
                  <Link to={`/listing/${listing._id}`} className="listing__info_left_content_name_link">
                  <span className="list__image_col">
                    <img
                      alt={listing.listingTitle}
                      src={listing.image}
                      
                    />
                  </span>
                  <span className="list_content_col">
                    <h4>{listing.listingTitle}</h4>
                    <p className="location__item_list">
                      {listing.businessCountry}, {listing.businessState}
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

                   
                  </span>
                </Link>
                 <Link to={`/listing/${listing._id}`} className="list_content_col_listing_des_text_wrap">
                 <h2 className="listing__main_des">Listing Description:</h2>
                     <span className="list_content_col_listing_des_text">
                              {(
                                listing?.listingDescription?.replace(/<[^>]*>/g, "") || "-"
                              ).slice(0, 200)}
                              {((listing?.listingDescription?.replace(/<[^>]*>/g, "") || "").length > 3)
                                ? "..."
                                : ""}
                            </span>
</Link>
                </span>
                <span  className="list_content_col_listing_des">
                
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
            // onClick={() => setPage((p) => Math.max(p - 1, 1))}
            onClick={() => {setPage(page-1); }}
            className="p-button-secondary"
          />
          <Button
            label="Next"
            disabled={total < limit }
            onClick={() => {setPage(page+1); }}
            className="p-button-secondary"
          />
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
