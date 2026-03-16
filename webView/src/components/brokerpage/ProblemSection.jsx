import prblm1 from "../../assets/prblm1.png";
import prblm2 from "../../assets/prblm2.png";
import prblm3 from "../../assets/prblm3.png";
import prblm4 from "../../assets/prblm4.png";
import buyerSubmission from "../../assets/buyerSubmission.png";


const ProblemSection = () => {
  return (
    <section className="problem__section_broker_page_container">
      <div className="problem__container">
         <div className="problem__left_section">
         <h2>The Problem</h2>
      <p>Selling businesses shouldn’t require juggling</p>
      <ul>
        <li><img src={prblm1} alt="Problem 1" />
          <p>Multiple listing portals</p>
        </li>
        <li><img src={prblm2} alt="Problem 2" />
          <p>Disconnected buyer inquiries</p>
        </li>
        <li><img src={prblm3} alt="Problem 3" />
          <p>Management of broken processes</p>
        </li>
        <li><img src={prblm4} alt="Problem 4" />
          <p>Inconsistent deal workflows</p>
        </li>
      </ul>
      <p>Yet for most brokers, that’s still the reality.</p>
     </div>
     <div className="problem__right_section">
        <img src={buyerSubmission} alt="Buyer Submission" />
     </div>
      </div>
    </section>
  );
};

export default ProblemSection;