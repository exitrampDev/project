import React from "react";
import YoucanSeeImg from "../../assets/youcnaSee.png";

export default function YoucanSee() {
  return (
    <div className="YoucanSee__main_wrapper">
      <div className="YoucanSee__container">
        <h3>Savings you can see.</h3>
        <p>
          We aim to significantly reduce your financial obligation during the
          sales transaction. Protecting your financial legacy is extraordinarily
          important to us.  We’ve built numerous process accelerators, education
          and software tools to support you in that endeavor.  These
          capabilities enable you to drive the transaction with more confidence
          and transparency.
        </p>
        <img src={YoucanSeeImg} alt="YoucanSeeImg" />
      </div>
    </div>
  );
}
