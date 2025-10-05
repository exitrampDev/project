import React from "react";
import { useRecoilValue } from "recoil";
import { propertiesState } from "../recoil/propertiesAtom";
import PropertyCard from "../components/PropertyCard";
import ArrowIcon from "../assets/arrowIcon.png";
import Header from "../components/Header";
import Footer from "../components/Footer";

const Listings = () => {
  const properties = useRecoilValue(propertiesState);
  const handleNonUserClick = () => {
    const signupBtn = document.querySelector(".signup-btn");
    if (signupBtn) signupBtn.click();
  };
  return (
    <>
      <Header />
      <div className="AboutHero__main_wrapper">
        <div className="AboutHero__container">
          <h4>Explore Confidential Business Opportunities</h4>
          <p>
            Browse Our Curated Marketplace of Business Listings, Buyers, and M&A
            Experts. Seller and Buyer Listings Contact Information is Kept
            Confidential. You Can Message Listings Owners Directly.
          </p>
        </div>
      </div>

      <PropertyCard />
      <div className="UpgradeFree_when_ready_wrap">
            <div className="UpgradeFree_when_ready_container">
              <h3>
                <span>Interested?</span> Create a Buyer Profile to Get Started
              </h3>
              <p>
                Create a free buyer profile to submit NDAs, unlock seller documents, and connect with businesses ready to talk.
              </p>
              <button className="UpgradeFree_when_ready_btn" onClick={handleNonUserClick}>
                Create Buyer Profile <img src={ArrowIcon} alt="ArrowIcon" />
              </button>
            </div>
          </div>
      <Footer />
    </>
  );
};

export default Listings;
