import whyBrokerUseExitramp from "../../assets/whyBrokerUseExitramp.png";
import whyBrokerIcon1 from "../../assets/whyBrokerIcon1.png";
import whyBrokerIcon2 from "../../assets/whyBrokerIcon2.png";
import whyBrokerIcon3 from "../../assets/whyBrokerIcon3.png";
import whyBrokerIcon4 from "../../assets/whyBrokerIcon4.png";

const WhyBrokersSection = () => {
  return (
    <section className="why-brokers__section_broker_page_container">
     <div className="why__broker_wrap">
           <div className="why__broker_left_col">
            <img src={whyBrokerUseExitramp} alt="Why Brokers Use Exit Ramp" />
        </div>
        <div className="why__broker_right_col">
            <h3>Why Brokers Use Exit Ramp</h3>
            <ul>
                <li><img src={whyBrokerIcon1} alt="Icon 1" /> Access to a larger pool of qualified buyers</li>
                <li><img src={whyBrokerIcon2} alt="Icon 2" /> Streamlined due diligence process</li>
                <li><img src={whyBrokerIcon3} alt="Icon 3" /> Enhanced visibility for business listings</li>
                <li><img src={whyBrokerIcon4} alt="Icon 4" /> Improved deal management and communication</li>
            </ul>
        </div>
     </div>
    </section>
  );
};

export default WhyBrokersSection;