import React from "react";
import { useRecoilValue } from "recoil";
import { propertiesState } from "../recoil/propertiesAtom";
import BrokerCard from "../components/BrokerCard";
import ArrowIcon from "../assets/arrowIcon.png";
import Header from "../components/Header";
import Footer from "../components/Footer";

const FindABroker = () => {
  // Accessing the Recoil state data
  const responseData = useRecoilValue(propertiesState);
  
  // Extract the brokers array safely, default to empty array if not loaded yet
  const brokers = responseData?.data || [];

  const handleNonUserClick = () => {
    const signupBtn = document.querySelector(".signup-btn");
    if (signupBtn) signupBtn.click();
  };

  return (
    <>
      <Header />
      <div className="AboutHero__main_wrapper">
        <div className="AboutHero__container">
          <h4>Find a Broker </h4>
          <p>
            Connect with our trusted network of business brokers to find the perfect match for your buying or selling needs. Our vetted brokers specialize in various industries and deal sizes, ensuring you get expert guidance and personalized service throughout your transaction journey.
          </p>
        </div>
      </div>

      {/* --- Dynamic Listings Section --- */}
      <div className="properties_list_wrapper saad">
        
            <BrokerCard />      
            
    </div>
      {/* --------------------------------- */}

      <div className="UpgradeFree_when_ready_wrap">
        <div className="UpgradeFree_when_ready_container">
          <h3>
            <span>Interested?</span> Create a Buyer Profile to Get Started
          </h3>
          <p>
            Create a free buyer profile to submit NDAs, unlock seller documents, and connect with businesses ready to talk.
          </p>
          {/* <button className="UpgradeFree_when_ready_btn" onClick={handleNonUserClick}>
            Create Buyer Profile <img src={ArrowIcon} alt="ArrowIcon" />
          </button> */}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default FindABroker;