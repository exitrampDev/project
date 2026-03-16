import feature1 from "../../assets/feature1.png";
import feature2 from "../../assets/feature2.png";
import feature3 from "../../assets/feature3.png";

const FeaturesSection = () => {
  return (
    <section className="features__section_broker_page_container">
      <h2>What Exit Ramp Does</h2>
      <h4>Exit Ramp brings together</h4>
      <div className="features__section_card_wrap">
        <div className="features__section_card">
            <img src={feature1} alt="Business-for-sale listings" />
          <h3>Business-For-Sale Listings</h3>  
        </div>
        <div className="features__section_card">
            <img src={feature2} alt="Buyer profiles and intent" />
            <h3>Buyer Profiles and Intent</h3>
        </div>
        <div className="features__section_card">
            <img src={feature3} alt="Tools that support deal progression" />
            <h3>Tools That Support Deal Progression</h3>
        </div>
      </div>
      <p>All in one platform designed specifically for business exits.</p>
      </section>
  ); 
};

export default FeaturesSection;