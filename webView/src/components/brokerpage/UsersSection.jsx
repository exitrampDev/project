import IconBroker1 from "../../assets/IconBroker1.png";
import IconBroker2 from "../../assets/IconBroker2.png";
import IconBroker3 from "../../assets/IconBroker3.png";
const UsersSection = () => {
  return (
    <section className="users__section_broker_page_container">
      <h2>Who uses Exit Ramp</h2>
      <p>Designed for</p>
        <div className="users__section_broker_page_cards_container">
            <div className="users__section_broker_page_card user_business_broker">
                <img src={IconBroker1} alt="Business Brokers" />
                <h3>Business brokers </h3>
            </div>
            <div className="users__section_broker_page_card user_business_owner">
                <img src={IconBroker2} alt="Business Owners" />
                <h3>M&A advisors </h3>
            </div>
            <div className="users__section_broker_page_card user_investor">
                <img src={IconBroker3} alt="Investors" />
                <h3>Deal professionals</h3>
            </div>
        </div>

    </section>
  );
};

export default UsersSection;