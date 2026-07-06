import React, { useState, useRef } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { Menubar } from "primereact/menubar";
import { Button } from "primereact/button";
import { Sidebar } from "primereact/sidebar";
import { Menu } from "primereact/menu";
import logo from "../assets/logo.png";
import signIcon from "../assets/signIcon.png";
import SignupPopup from "./SignupPopup";
import { authState } from "../recoil/ctaState";
import { useRecoilValue, useSetRecoilState } from "recoil";

// icons
import icon1 from "../assets/buyerIcon.png";
import icon2 from "../assets/sellerIcon.png";
import icon5 from "../assets/freeBuyerAcc.png";
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
];

const roleOptions = {
  buyer: {
    title: "Choose Buyer Plan",
    subtitle: "Select the right plan to begin your buyer journey.",
    subOptions: [
      {
        icon: icon5,
        title: "Free Buyer Account",
        description:
          "Browse listings, submit NDA requests, and save favorites.",
        button: {
          text: "Continue",
          link: "/register",
          roleOptionValue: "buyer_basic",
        },
      },
    ],
  },
  seller: {
    title: "Choose Seller Plan",
    subtitle: "Select how you’d like to list your business.",
    subOptions: [
      {
        icon: icon8,
        title: "Seller Sign Up",
        description:
          "Manage NDAs, CIMs, documents, and buyer access.",
        button: {
          text: "Register",
          link: "/register",
          roleOptionValue: "seller_central",
        },
      },
    ],
  },
};

const Header = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [popupStep, setPopupStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState(null);

  const [mobileVisible, setMobileVisible] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const auth = useRecoilValue(authState);
  const setAuth = useSetRecoilState(authState);

  const currentPath = location.pathname;

  const handleLogout = () => {
    setAuth(null);
    localStorage.clear();
    navigate("/");
  };

  // ================= POPUP =================
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
    if (roleKey === "ma_expert" || roleKey === "subscriber") {
      closePopup();
      navigate("/register", { state: { role: roleKey } });
      return;
    }
    setSelectedRole(roleKey);
    setPopupStep(2);
  };

  const handlePlanSelect = (roleKey) => {
    closePopup();
    navigate("/register", { state: { role: roleKey } });
  };

  // ================= NAV ITEMS =================
  const navItems = [
    { label: "Listings", command: () => navigate("/listings") },
    { label: "Find a Broker", command: () => navigate("/find-broker") },
    { label: "Pricing", command: () => navigate("/pricing") },
    {
      label: "Features",
      items: [
        { label: "Selling", command: () => navigate("/seller-features") },
        { label: "Buying", command: () => navigate("/page/buying") },
        { label: "Experts", command: () => navigate("/page/experts") },
      ],
    },
    {
      label: "Resources",
      items: [
        { label: "Insights", command: () => navigate("/insight") },
        { label: "How to Use", command: () => navigate("/page/how-to-use") },
        { label: "Contact Us", command: () => navigate("/contactus") },
        // { label: "Submit Ticket", command: () => navigate("/submit-ticket") },
      ],
    },
  ];

  // ================= MOBILE MENU =================
  const mobileMenuItems = navItems.map((item) => ({
    label: item.label,
    command: item.command
      ? () => {
          setMobileVisible(false);
          item.command();
        }
      : undefined,
    items: item.items
      ? item.items.map((sub) => ({
          label: sub.label,
          command: () => {
            setMobileVisible(false);
            sub.command();
          },
        }))
      : undefined,
  }));

  // ================= HEADER UI =================
  const start = (
    <div className="logo_col flex align-items-center gap-2">
      <NavLink to="/">
        <img src={logo} alt="Logo" />
      </NavLink>

      <Button
        icon="pi pi-bars mobile-menu-icon-only-mobile"
        className="p-button-text mobile-menu-btn"
        onClick={() => setMobileVisible(true)}
      />
    </div>
  );

  const end = auth?.access_token ? (
    <>
      <button onClick={handleLogout} className="logout-btn header-logout-btn">
        Logout <img src={signIcon} alt="icon" />
      </button>

      <NavLink to="/user/dashboard" className="signup-btn">
        Dashboard <img src={signIcon} alt="icon" />
      </NavLink>
    </>
  ) : (
    <>
    <Button className="login-btn">

      <NavLink to="/login" className="login-btn-login-page">
        Login <img src={signIcon} alt="icon" />
      </NavLink>
    </Button>

      <button onClick={openPopup} className="signup-btn">
        Sign Up <img src={signIcon} alt="icon" />
      </button>
    </>
  );

  return (
    <header className="signup_content">
      {/* DESKTOP MENU */}
      <Menubar model={navItems} start={start} end={end} />

      {/* MOBILE DRAWER */}
      <Sidebar
        visible={mobileVisible}
        onHide={() => setMobileVisible(false)}
        position="left"
        className="mobile-sidebar-just-mobile-menu"
      >
        <Menu model={mobileMenuItems} />
      </Sidebar>

      {/* SIGNUP POPUP */}
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