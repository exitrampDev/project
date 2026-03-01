import React from "react";

const plans = [
  {
    name: "Basic",
    subtitle: "Launch Offer (Limited Time)",
    price: "$10",
    discountedPrice: "$0",
    period: " / month / listing",
    description: "For buyers getting started",
    features: [
          "Save Favorites",
          "View Previous Listings",
          "Maintain Confidential Profile",
          "Connect with Listers",
          "Dashboard Statistics",
          "Submit NDAs",
          "View CIMs",
          "Due Diligence List",
          "Engage with Sellers"

    ],
    cta: "Sign Up",
  },
  {
    name: "Standard",
    subtitle: "Coming Soon ",
    price: "$30",
    period: " / month / listing",
    description: "For buyers and sellers ready to list. ",
    features: [
      "Everything in Basic",
      "One Public Listing",
      "Confidential Listing",
      "Manage Listing",
      "Listing Statistics",
      "Add Listing at Fee",
      "Listing Notifications",
      "Cancel Anytime"

    ],
    pricestatus: "coming-soon",
    cta: "Coming Soon",
  },
  {
    name: "Premium",
    subtitle: "Launch Offer (Limited Time)",
    price: "$60",
    discountedPrice: "$30",
    period: " / month / listing",
    description: "For active deals and serious sellers. ",
    features: [
        "Everything in Basic",
        "Includes One Public Listing",
        "Manage NDA Request",
        "Analyze Buyers",
        "Document Room",
        "Due Diligence List",
        "Manage Multiple Listings",
        "Monthly Listing Renewals",
        "(no 6 month term)",
        "No Success Fees. Just a simple monthly listing fee(s). "

    ],
    cta: "Sign Up",
  },
];
  const handleSignupClick = () => {
    const signupBtn = document.querySelector(".signup-btn");
    if (signupBtn) {
      signupBtn.click();
    }
  };
  
export default function PricingCards() {
  return (
    <section className="PricingCards__wrapper">
      <div className="PricingCards__container">
        {plans.map((plan, index) => (
          <div className="PricingCard" key={index}>
            {plan.badge && <span className="PricingCard__badge">{plan.badge}</span>}
            <h3>{plan.name}</h3>
            <p className="PricingCard__subtitle">{plan.subtitle}</p>
            <div className="PricingCard__price">
              {plan.discountedPrice ? (
                <>
                  <strike className="PricingCard__original-price">{plan.price} </strike>
                  <strong className="PricingCard__discounted-price">{plan.discountedPrice}</strong>
                   {plan.period && <span>{plan.period}</span>} 
                </>
              ) : (
                <>
                <strong>{plan.price}   </strong> 
                {plan.period && <span>{plan.period}</span>}
                </>
              )}
              {/* <strong>{plan.price}</strong> <em>{plan.discountedPrice}</em>
              {plan.period && <span>{plan.period}</span>} */}
            </div>
            <p className="PricingCard__description">{plan.description}</p>
            <ul className="PricingCard__features">
              {plan.features.map((feature, i) => (
                <li key={i}><span>✔</span> {feature}</li>
              ))}
            </ul>
            {plan.pricestatus === "coming-soon" ? (
              <button className="PricingCard__cta coming-soon" disabled>
                {plan.cta}
              </button>
            ) : ( 
              <button
              className="PricingCard__cta"
              onClick={handleSignupClick}
            >
              {plan.cta}
            </button>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
