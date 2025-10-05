import React from "react";
import ArrowIcon from "../../assets/arrowIcon.png";

export default function UpgradeFree() {
  return (
    <div className="UpgradeFree_when_ready_wrap">
      <div className="UpgradeFree_when_ready_container">
        <h3>
          <span>Start Free.</span> Upgrade When You’re Ready.
        </h3>
        <p>
          Buyers can start browsing for free. Unlock direct messaging, CIMs, and
          more when you upgrade.
        </p>
        <button className="UpgradeFree_when_ready_btn">
          Compare Buyer Plans <img src={ArrowIcon} alt="ArrowIcon" />
        </button>
      </div>
    </div>
  );
}
