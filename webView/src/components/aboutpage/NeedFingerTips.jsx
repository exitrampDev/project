import React from "react";
import TableReactangle from "../../assets/tableReactangle.png";

export default function NeedFingerTips() {
  return (
    <div className="NeedFingerTips__wrap_main">
      <div className="NeedFingerTips__container">
        <div className="NeedFingerTips__content_box">
          <h3>Tools you need at your fingertips.</h3>
          <p>
            I created ExitRamp to give sellers and buyers the tools and
            information they need to successfully close.  More importantly, I
            never wanted to see another seller just throw up their arms and give
            up.  I wanted to close the gap between buyers and sellers and even
            if that gap closes just a little, I truly believe that we can
            significantly improve the business sales process.
          </p>
        </div>
        <div className="NeedFingerTips__img_block">
          <img src={TableReactangle} alt="TableReactangle" />
        </div>
      </div>
    </div>
  );
}
