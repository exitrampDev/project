import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import ArrowIcon from "../assets/arrowIcon.png";

const SignupPopup = ({
  step,
  selectedRole,
  onClose,
  onSelectRole,
  backToStep1,
  roleOptions,
  step1Options,
  onSelectPlan,
}) => {
  
  // Automatically trigger the plan selection if the role is "seller"
  useEffect(() => {
    if (step === 2 && selectedRole === "seller" && roleOptions?.seller?.subOptions) {
      const sellerOptions = roleOptions.seller.subOptions;
      
      // Check if there is at least one sub-option and it has a button configuration
      if (sellerOptions.length > 0 && sellerOptions[0].button) {
        const firstSubOption = sellerOptions[0];
        
        // This triggers the same function that className="popup_btn" calls
        onSelectPlan(firstSubOption.button.roleOptionValue, firstSubOption);
      }
    }
  }, [step, selectedRole, roleOptions, onSelectPlan]);

  return (
    <div className="popup_overlay" onClick={onClose}>
      <div className="popup_modal_signup" onClick={(e) => e.stopPropagation()}>
        {/* STEP 1: Choose Role */}
        {step === 1 && (
          <>
            <h3>Choose Your Account Type</h3>
            <p>Select how you’d like to use Exit Ramp.</p>
            <div className="popup_options">
              {step1Options.map((item, index) => (
                <div
                  key={index}
                  className="popup_option"
                  onClick={() => onSelectRole(item.value)}
                >
                  <div className="popup__content_block">
                    <img
                      src={item.icon}
                      alt={item.title}
                      className="popup_icon"
                    />
                    <h4>{item.title}</h4>
                    <p>{item.description}</p>
                  </div>
                </div>
              ))}
              <div className="login__content">
                Already have an account?{" "}
                <Link to="/login" onClick={onClose}>
                  Log in
                </Link>
              </div>
            </div>
          </>
        )}

        {/* STEP 2: Sub Options for Selected Role */}
        {step === 2 && selectedRole && (
          <div className="step__two_main">
            <h3>{roleOptions[selectedRole]?.title}</h3>
            <p>{roleOptions[selectedRole]?.subtitle}</p>

            <div className="popup_options">
              {roleOptions[selectedRole]?.subOptions?.map((sub, index) => (
                <div key={index} className="popup_option">
                  <div className="popup__content_block">
                    {sub.icon && (
                      <img
                        src={sub.icon}
                        alt={sub.title}
                        className="popup_icon"
                      />
                    )}
                    <h4>{sub.title}</h4>
                    <p>{sub.description}</p>
                    {sub.button && (
                      <button
                        className="popup_btn"
                        onClick={() => onSelectPlan(sub.button.roleOptionValue, sub)}
                      >
                        {sub.button.text}{" "}
                        <img src={ArrowIcon} alt="ArrowIcon" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <button className="back_btn" onClick={backToStep1}>
              <img src={ArrowIcon} alt="ArrowIcon" /> Back to Role Selection
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SignupPopup;