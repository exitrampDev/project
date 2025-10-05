import React from "react";
import PropertyCard from "../components/PropertyCard";
import HeroSec from "../components/homepage/HeroSec";
import WhoUseSec from "../components/homepage/WhoUseSec";
import PlatformFeature from "../components/homepage/PlatformFeature";
import ExitRampPricing from "../components/homepage/ExitRampPricing";
import HowItWorks from "../components/homepage/HowItWorks";
import ComplienceStatement from "../components/homepage/ComplienceStatement";
import UpgradeFree from "../components/homepage/UpgradeFree";
import Header from "../components/Header";
import Footer from "../components/Footer";

const Home = () => {
  return (
    <>
      <Header />
      <HeroSec />
      <WhoUseSec />
      <PlatformFeature />
      <ExitRampPricing />
      <HowItWorks />
      <ComplienceStatement />
      <UpgradeFree />
      <Footer />
    </>
  );
};

export default Home;
