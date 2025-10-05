import React from "react";
import NextGreatThing from "../../assets/NextGreatThing.png";

export default function GreatThing() {
  return (
    <div className="GreatThing__main_wrap">
      <div className="GreatThing__container">
        <div className="GreatThing__img_block">
          <img src={NextGreatThing} alt="NextGreatThing" />
        </div>
        <div className="GreatThing__content_block">
          <h3>Let us help you do the next great thing.</h3>
          <p>
            My hope is that ExitRamp can support you in successfully
            transitioning your business. We are maniacal in this endeavor
            everyday and constantly looking to add more to your toolbox and
            therefore enabling your success. Let us do the heavy lifting. Let
            our process accelerators and education guide you.  Let our community
            be your sounding board.  Let our platform automate the mundane
            processes. Let us help you get your transaction done so you can do
            the next great thing.
          </p>
          <p>
            I’m glad you're here and I truly hope that ExitRamp can assist in
            your journey.
          </p>
          <p>Josh Perry</p>
          <p>Managing Director of ExitRamp</p>
          <p className="exploring__content">
            Take action.  Explore our offerings…
          </p>
        </div>
      </div>
    </div>
  );
}
