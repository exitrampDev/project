import React from "react";
import ImgSmarter from "../../assets/imgCardSmart.png";

export default function OurMission() {
  return (
    <div className="OurMission__main_wrap">
      <h2>Our Mission</h2>
      <div className="OurMission__container">
        <div className="OurMission__left_col">
          <h4>Making Exits Smarter, Not Harder</h4>
          <p>
            Our Mission is to ensure business owners never need to close their
            doors when it’s time to transition their life’s work. To that end,
            we’ve created a comprehensive digital M&A platform where business
            owners can do more than just create a listing.
          </p>
          <img src={ImgSmarter} alt="ImgSmarter" />
        </div>
        <div className="OurMission__right_col">
          <div className="OurMission__right_col_top_row">
            <h4>The Realities That Inspired ExitRamp</h4>
            <p>
              Like you, I spent years owning and managing my own businesses,
              only to come to the end of the journey without fully understanding
              how to transition those businesses to a potential buyer. It was an
              arduous and expensive process that only left me frustrated.
              However, I eventually transitioned two of my businesses. One on a
              handshake deal and another through closure. Neither result was
              ideal, but it allowed me to move to the next journey, acquisition
              entrepreneurship.
            </p>
          </div>
          <div className="OurMission__right_col_bottom_row">
            <h4>What I Discovered Changed Everything</h4>
            <p>
              I shifted my focus to acquisition entrepreneurship where I engaged
              hundreds of sellers and their representatives over the course of
              several years. My intent was to buy a platform business and
              eventually to add other businesses from there. Instead I
              discovered that business owners are significantly under tooled  to
              transition their business and the market is not built to support
              them in that transition.  Just like I wasn’t.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
