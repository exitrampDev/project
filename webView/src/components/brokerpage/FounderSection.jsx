import { Button } from "primereact/button";
import FounderExitramp from "../../assets/FounderExitramp.png";
import { useNavigate } from "react-router-dom";
const FounderSection = () => {
   const navigate = useNavigate();
  return (
    <section className="founder__section_broker_page_container">
      <div className="founder__section_left_col">
        <h2>From the Founder</h2>
        <div className="intro__founder_Sec">
          Thanks for visiting. I’ve spent the better part of 25 years building and implementing enterprise applications for some of the world's largest companies.  I’m not a business broker, but I’ve connected to hundreds of brokers for potential acquisitions.
        </div>
        <div className="leaning__founder_Sec">
          In that time, I learned that the <strong>process of connecting buyers and sellers is still far more manual, fragmented, and inefficient than it should be.</strong>
        </div>
        <div className="conclusion__founder_Sec">
          I know that the process can be overwhelming, but it doesn’t need to be. By building a purpose driven solution, I believe that the complexities within business brokering can be more effectively managed.
        </div>
        <div className="conclusion__founder_Sec">
          Exit Ramp was built around a simple idea:
        </div>
        <div className="conclusion__founder_Sec">
          <strong>Bring listings, buyer demand, and deal tools into one workflow — without changing how brokers already operate.</strong>
        </div>
        <div className="conclusion__founder_Sec">
          We’ve just launched our initial set of features and are opening access to a small group of brokers.
        </div>
        <div className="conclusion__founder_Sec">
          If you’re curious, you can see what we’re building here:
        </div>
        <Button label="Get Started" className="get-started-button-header" onClick={() => navigate("/pricing")} />
        <div className="conclusion__founder_Sec">
          No pressure — just sharing in case it’s useful.
        </div>
         <div className="conclusion__founder_Sec">
          <em>Best regards,</em> 
            <em>Josh Perry Founder, </em>
           <em> Exit Ramp</em>
        </div>
      </div>
      <div className="founder__section_right_col">
        <img src={FounderExitramp} alt="Founder of Exit Ramp" />
      </div>
    </section>
  );
};

export default FounderSection;