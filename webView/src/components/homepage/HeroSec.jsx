import React from "react";
import bannerDashboardImg from "../../assets/bannerDashboardImg.png";
import ListingQuickFilter from "../ListingQuickFilter";
export default function HeroSec() {
  return (
    <div className="bannerSecContent_wrap">
      <div className="bannerSecContent">
        <div className="contentSecLeft">
          <h3>Confidential M&A Listings. Curated Buyers. Trusted Experts.</h3>
          <p>
            Exit Ramp is where serious buyers and sellers connect—with private
            listings, secure NDAs, and pre-screened profiles.
          </p>
          <div className="listing__filter_wrap_hero">
            <ListingQuickFilter/>
          </div>
        </div>
        <div className="imageBannerRight">
          <img src={bannerDashboardImg} alt="-" />
        </div>
      </div>
    </div>
  );
}
