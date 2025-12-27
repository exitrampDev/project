import React from "react";

const plans = [
  {
    name: "Basic",
    price: "Free",
    description: "For sellers and buyers getting started",
    features: [
      "Save Favorites",
      "Previously Viewed Listings",
      "Confidential Profile",
      "Profile Connection",
      "Dashboard Statistics",
      "Listing Suggestions",
    ],
    cta: "Sign Up",
  },
  {
    name: "Standard",
    price: "$30",
    period: "/ month / listing",
    description: "For sellers preparing to engage buyers",
    features: [
      "Everything in Basic",
      "One Public Listing",
      "Confidential Listing",
      "Manage Listings",
      "Listing Statistics",
      "Add Listings at Fee",
      "Submit NDAs",
      "View CIMs",
      "Due Diligence List",
      "Engage with Sellers",
    ],
    badge: "Most Popular",
    cta: "Sign Up",
  },
  {
    name: "Premium",
    price: "$60",
    period: "/ month / listing",
    description: "For active deals and serious sellers",
    features: [
      "Everything in Standard",
      "Seller Central",
      "NDA Management",
      "Buyer Profile Reviews",
      "Document Room",
      "Due Diligence List",
      "Private Messaging",
      "Marketing Enablement",
      "Manage Buyer Access Per Listing",
    ],
    cta: "Sign Up",
  },
];

export default function PricingCards() {
  return (
    <section className="PricingCards__wrapper">
      <div className="PricingCards__container">
        {plans.map((plan, index) => (
          <div className="PricingCard" key={index}>
            {plan.badge && <span className="PricingCard__badge">{plan.badge}</span>}
            <h3>{plan.name}</h3>
            <div className="PricingCard__price">
              <strong>{plan.price}</strong>
              {plan.period && <span>{plan.period}</span>}
            </div>
            <p className="PricingCard__description">{plan.description}</p>
            <ul className="PricingCard__features">
              {plan.features.map((feature, i) => (
                <li key={i}>✔ {feature}</li>
              ))}
            </ul>
            <button className="PricingCard__cta">{plan.cta}</button>
          </div>
        ))}
      </div>
    </section>
  );
}
