import React from "react";
import HeroSection from "../components/brokerpage/HeroSection";
import UsersSection from "../components/brokerpage/UsersSection";
import ProblemSection from "../components/brokerpage/ProblemSection";
import FeaturesSection from "../components/brokerpage/FeaturesSection";
import WhyBrokersSection from "../components/brokerpage/WhyBrokersSection";
import PhilosophySection from "../components/brokerpage/PhilosophySection";
import FounderSection from "../components/brokerpage/FounderSection";
import Footer from "../components/brokerpage/Footer";

export default function LandingPage() {
  return (
    <div>
      <HeroSection />
      <UsersSection />
      <ProblemSection />
       <FeaturesSection />
      <WhyBrokersSection />
      <PhilosophySection />
      <FounderSection />
      <Footer />
    </div>
  );
}