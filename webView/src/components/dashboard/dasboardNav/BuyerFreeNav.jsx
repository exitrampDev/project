import React from "react";
import { NavLink } from "react-router-dom";
import icon1 from "../../../assets/d-icon.png";
import icon2 from "../../../assets/d-icon1.png";
import icon3 from "../../../assets/d-icon2.png";
import icon21 from "../../../assets/icon21.png";
import icon22 from "../../../assets/icon22.png";
import icon23 from "../../../assets/icon23.png";
import icon24 from "../../../assets/icon24.png";
import icon25 from "../../../assets/icon25.png";
import icon26 from "../../../assets/icon26.png";
import icon27 from "../../../assets/icon27.png";
import icon28 from "../../../assets/icon28.png";

export default function BuyerFreeNav() {
  return (
    <div className="nav__dashboard">
      <ul>
        <li>
          <NavLink
            to="/"
            className={({ isActive }) => (isActive ? "active" : "")}>
            <img src={icon3} alt="Dashboard" /> Web View
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/user/dashboard"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <img src={icon1} alt="Dashboard" /> Dashboard
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/user/my-save-listing"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <img src={icon23} alt="Saved Listing" /> Saved Listing
          </NavLink>
        </li>
         <li>
                            <NavLink
                              to="/user/my-invited-listing"
                              className={({ isActive }) => (isActive ? "active" : "")}
                            >
                              <img src={icon23} alt="Saved Listing" /> Invited Listing
                            </NavLink>
                          </li>
        <li>
          <NavLink
            to="/user/complete-profile-buyer-free"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <img src={icon28} alt="Profile" /> Profile
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/user/recent-view-listing"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <img src={icon2} alt="Recently Viewed" /> Recently Viewed
          </NavLink>
        </li>
         <li>
          <NavLink
            to="/user/nda-requested"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <img src={icon21} alt="NDA Requested" /> NDA Requested
          </NavLink>
        </li>
      </ul>
    </div>
  );
}
