import React from "react";
import AboutHero from "../components/aboutpage/AboutHero";
import OurMission from "../components/aboutpage/OurMission";
import NeedFingerTips from "../components/aboutpage/NeedFingerTips";
import YoucanSee from "../components/aboutpage/YoucanSee";
import GreatThing from "../components/aboutpage/GreatThing";
import CTA from "../components/CTA";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function AboutUS() {
  return (
    <>
      <Header />
      <AboutHero />
      <OurMission />
      <NeedFingerTips />
      <YoucanSee />
      <GreatThing />
      <CTA
        id="abt-cta"
        title="We Built ExitRamp </br>
to Help You Close Confidently."
        description="Everything we do is designed to support business owners through the transition process — with the tools, guidance, and community you deserve."
        buttonText="Explore Our Platform"
        to="/listings"
      />
      <Footer />
    </>
  );
}
