import PhilosophyBg from "../../assets/PhilosophyBg.jpg";
const PhilosophySection = () => {
  return (
    <section className="philosophy__section_broker_page_container" style={{ backgroundImage: `url(${PhilosophyBg})` }}>
      <h2>Philosophy</h2>
      <p>Confidential. Trust-Driven. Process-Focused. Broker-Supportive.</p>
      <h4>Built by people who understand small business transactions and respect the role brokers play in them.</h4>
    </section>
  );
};

export default PhilosophySection;