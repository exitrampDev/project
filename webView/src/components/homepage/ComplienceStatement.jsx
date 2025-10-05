import React from "react";
import ComplienceStatementImg from "../../assets/ComplienceStatement-img.png";
import ArrowIcon from "../../assets/arrowIcon.png";

export default function ComplienceStatement() {
  return (
    <div className="ComplienceStatement_wrapper">
      <div className="ComplienceStatement_container">
        <div className="ComplienceStatement_image_box">
          <img src={ComplienceStatementImg} alt="ComplienceStatementImg" />
        </div>
        <div className="ComplienceStatement_content_box">
          <h4>Compliance Security Statement</h4>
          <p>
            Exit Ramp was built with serious transactions in mind. All activity
            is gated behind account access, role-based permissions, and mutual
            NDAs. Your data and deal are never exposed without your control.
          </p>
          <button className="arrowIcon">
            Learn How We Protect Sellers <img src={ArrowIcon} alt="ArrowIcon" />
          </button>
        </div>
      </div>
    </div>
  );
}
