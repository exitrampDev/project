import React, { useState } from "react";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { useRecoilValue } from "recoil";
import {
  usStatesState,
  usCountiesByState,
} from "../recoil/ctaState";
import { useNavigate } from "react-router-dom";

const ListingQuickFilter = ({ redirectTo = "/listings" }) => {
  const states = useRecoilValue(usStatesState);
  const navigate = useNavigate();

  const [industry, setIndustry] = useState("");
  const [state, setState] = useState("");
  const [county, setCounty] = useState("");

  const counties = state ? usCountiesByState[state] || [] : [];

  const handleSubmit = () => {
    const params = new URLSearchParams();

    if (industry) params.append("industry", industry);
    if (state) params.append("state", state);
    if (county) params.append("county", county);

    navigate(`${redirectTo}?${params.toString()}`);
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
  return (
    <div className="listing__quick_filter flex gap-3">
      {/* Industry */}
     <Dropdown
     className="listing__filter_industry"
  value={industry}
  options={industryOptions}
  placeholder="Select Industry"
  filter
  showClear
  onChange={(e) => setIndustry(e.value)}
/>

      {/* State */}
      <Dropdown
      className="listing__filter_state"
        value={state}
        options={states}
        placeholder="State"
        filter
        showClear
        onChange={(e) => {
          setState(e.value);
          setCounty("");
        }}
      />

      {/* County */}
      <Dropdown
      className="listing__filter_county"
        value={county}
        options={counties}
        placeholder="County"
        disabled={!state}
        filter
        showClear
        onChange={(e) => setCounty(e.value)}
 
      />

      {/* Submit */}
      <Button
        label="Search"
        onClick={handleSubmit}
        className="listing__filter_submit"
      />
    </div>
  );
};

export default ListingQuickFilter;
