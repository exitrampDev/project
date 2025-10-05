import React from "react";
import PropertyCard from "../components/PropertyCard";
import HeroSec from "../components/homepage/HeroSec";
import WhoUseSec from "../components/homepage/WhoUseSec";
import PlatformFeature from "../components/homepage/PlatformFeature";
import ExitRampPricing from "../components/homepage/ExitRampPricing";
import HowItWorks from "../components/homepage/HowItWorks";
import ComplienceStatement from "../components/homepage/ComplienceStatement";
import UpgradeFree from "../components/homepage/UpgradeFree";

const Home = () => {
  return (
    <>
      <HeroSec />
      <WhoUseSec />
      <PlatformFeature />
      <ExitRampPricing />
      <HowItWorks />
      <ComplienceStatement />
      <UpgradeFree />
    </>
  );
};

export default Home;
