import React from "react";
import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";
import herobannerBroker from "../../assets/herobannerBroker.png";
import { NavLink } from "react-router-dom";
import logo from "../../assets/logo.png";
import heroBannerBg from "../../assets/heroBannerBg.jpg";

export default function HeroSection() {
  const navigate = useNavigate();
  return (
    <>
  <section className="hero-section-container" style={{ backgroundImage: `url(${heroBannerBg})` }}>
      <section className="hero-header-section">
         <NavLink to="/">
        <img src={logo} alt="Logo" />
      </NavLink>
       <Button label="Get Started" className="get-started-button-header" onClick={() => navigate("/pricing")} />

    </section>
    <section className="hero-section">
        <div className="hero-content">  
            <h2>Built to Support Business Brokers — Not Replace Them</h2>
            <p>Exit Ramp is a transaction-focused platform that helps brokers connect qualified buyers and sellers with less friction and more structure.</p>
            <Button label="Get Started" className="get-started-button-banner" onClick={() => navigate("/pricing")} />
        </div>
        <img src={herobannerBroker} alt="Hero Image" className="hero-image" />
    </section>
  </section>
    </>
  );
}