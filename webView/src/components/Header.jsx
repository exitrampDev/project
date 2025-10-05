import React, { useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { Menubar } from "primereact/menubar";
import { Button } from "primereact/button";
import logo from "../assets/logo.png";
import signIcon from "../assets/signIcon.png";
import SignupPopup from "./SignupPopup";

// Icons
import icon1 from "../assets/buyerIcon.png";
import icon2 from "../assets/sellerIcon.png";
import icon3 from "../assets/mnaIcon.png";
import icon4 from "../assets/subsIcon.png";
import icon5 from "../assets/freeBuyerAcc.png";
import icon6 from "../assets/paidBuyerAcc.png";
import icon7 from "../assets/freeSellerAcc.png";
import icon8 from "../assets/paidSellerAcc.png";

const accountTypes = [
  {
    icon: icon1,
    title: "I'm a Buyer",
    description: "Browse listings, submit NDAs, and connect with sellers.",
    value: "buyer",
  },
  {
    icon: icon2,
    title: "I'm a Seller",
    description: "List your business and manage interest from serious buyers.",
    value: "seller",
  },
  {
    icon: icon3,
    title: "I'm an M&A Expert",
    description: "Showcase your expertise and help sellers close strong deals.",
    value: "ma_expert",
  },
  {
    icon: icon4,
    title: "I Just Want Updates",
    description: "Sign up for insights and M&A market news.",
    value: "Subscriber",
  },
];

const roleOptions = {
  buyer: {
    title: "Choose Buyer Plan",
    subtitle: "Select the right plan to begin your buyer journey on Exit Ramp.",
    subOptions: [
      {
        icon: icon5,
        title: "Free Buyer Account",
        description:
          "Browse listings, submit NDA requests, and save favorites — all with full confidentiality and no cost.",
        button: {
          text: "Continue with Free Account",
          link: "/register",
        },
      },
      {
        icon: icon6,
        title: "Premium Buyer Account",
        description:
          "Get direct access to sellers, unlock CIMs after NDA approval, and use advanced tools built for buyers.",
        button: {
          text: "Upgrade to Premium Buyer",
          link: "/register",
        },
      },
    ],
  },
  seller: {
    title: "Choose Seller Plan",
    subtitle:
      "Select how you’d like to list and manage your business on Exit Ramp.",
    subOptions: [
      {
        icon: icon7,
        title: "Free Seller Account",
        description:
          "List your business, manage NDA requests, and message buyers privately — all while keeping your identity protected.",
        button: {
          text: "Continue with Free Account",
          link: "/register",
        },
      },
      {
        icon: icon8,
        title: "Seller Central Account (Premium)",
        description:
          "Get the full toolkit: NDA and CIM management, 2-year listing, buyer insights, and expert selling resources.",
        button: {
          text: "Upgrade to Seller Central",
          link: "/register",
        },
      },
    ],
  },
  ma_expert: {
    title: "I’m an M&A Expert",
    subtitle: "Choose your advisory service.",
    subOptions: [
      {
        icon: icon1,
        title: "Legal Advisor",
        description: "Support deal structures and compliance.",
        button: {
          text: "Continue with Free Account",
          link: "/free-buyer",
        },
      },
      {
        icon: icon1,
        title: "Financial Advisor",
        description: "Provide valuations and funding options.",
        button: {
          text: "Continue with Free Account",
          link: "/free-buyer",
        },
      },
    ],
  },
  Subscriber: {
    title: "I’m a Subscriber",
    subtitle: "Choose your Subscriber type.",
    subOptions: [
      {
        icon: icon1,
        title: "Angel Subscriber",
        description: "Invest in early-stage companies.",
        button: {
          text: "Continue with Free Account",
          link: "/subcriber",
        },
      },
      {
        icon: icon1,
        title: "VC Firm",
        description: "Find scalable investment opportunities.",
        button: {
          text: "Continue with Free Account",
          link: "/subcriber",
        },
      },
    ],
  },
};

const Header = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [popupStep, setPopupStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const currentPath = location.pathname;

  const openPopup = () => {
    setPopupStep(1);
    setSelectedRole(null);
    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
    setPopupStep(1);
    setSelectedRole(null);
  };

  const handleRoleSelect = (roleKey) => {
    // Redirect if role is ma_expert or subscriber
    if (roleKey === "ma_expert") {
      closePopup();
      navigate("/register", {
        state: {
          role: roleKey,
        },
      });
    }
    if (roleKey === "Subscriber") {
      closePopup();
      navigate("/register", {
        state: {
          role: roleKey,
          plan: planOption,
        },
      });
    }
    // Proceed to Step 2 for other roles
    setSelectedRole(roleKey);
    setPopupStep(2);
  };
  const handlePlanSelect = (roleKey) => {
    closePopup();
    navigate("/register", {
      state: {
        role: roleKey,
      },
    });
  };
  const navItems = [
    {
      label: "Home",
      command: () => navigate("/"),
      className: currentPath === "/" ? "p-menuitem-active" : "",
    },
    {
      label: "Listings",
      command: () => navigate("/listings"),
      className: currentPath.startsWith("/listings") ? "p-menuitem-active" : "",
    },
    {
      label: "About Us",
      command: () => navigate("/aboutus"),
      className: currentPath === "/aboutus" ? "p-menuitem-active" : "",
    },
    {
      label: "Contact Us",
      command: () => navigate("/contactus"),
      className: currentPath === "/contactus" ? "p-menuitem-active" : "",
    },
  ];
  const start = (
    <div className="logo_col">
      <NavLink to="/">
        <img src={logo} alt="Logo" />
      </NavLink>
    </div>
  );

  const end = (
    <button onClick={openPopup}>
      Sign Up <img src={signIcon} alt="signIcon" />
    </button>
  );
  return (
    <header className="signup_content">
      <Menubar model={navItems} start={start} end={end} />

      {showPopup && (
        <SignupPopup
          step={popupStep}
          selectedRole={selectedRole}
          onClose={closePopup}
          onSelectRole={handleRoleSelect}
          backToStep1={() => setPopupStep(1)}
          step1Options={accountTypes}
          roleOptions={roleOptions}
          onSelectPlan={handlePlanSelect}
        />
      )}
    </header>
  );
};

export default Header;
