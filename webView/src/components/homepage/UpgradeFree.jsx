import React from "react";
import { useNavigate } from "react-router-dom";
import ArrowIcon from "../../assets/arrowIcon.png";

export default function UpgradeFree() {
  const navigate = useNavigate();

  return (
    <div className="UpgradeFree_when_ready_wrap">
      <div className="UpgradeFree_when_ready_container">
        <h3>
          <span>Start Free.</span> Upgrade When You’re Ready.
        </h3>
        <p>
          Start browsing for free. Unlock listing management, direct messaging,
          CIM management and more when you upgrade.
        </p>

        <button
          className="UpgradeFree_when_ready_btn"
          onClick={() => navigate("/pricing")}
        >
          Compare Plans <img src={ArrowIcon} alt="ArrowIcon" />
        </button>
      </div>
    </div>
  );
}
