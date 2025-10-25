import React from "react";
import { NavLink } from "react-router-dom";
import icon1 from "../../../assets/d-icon.png";
import icon2 from "../../../assets/d-icon1.png";
import icon3 from "../../../assets/d-icon2.png";

export default function BuyerFreeNav() {
  return (
    <div className="nav__dashboard">
      <ul>
        <li>
          <NavLink
            to="/"
            className={({ isActive }) => (isActive ? "active" : "")}>
            <img src={icon1} alt="Dashboard" /> Web View
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
            <img src={icon2} alt="Saved Listing" /> Saved Listing
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/user/complete-profile-buyer-free"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <img src={icon2} alt="My Listing" /> Profile
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/user/recent-view-listing"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <img src={icon3} alt="Recently Viewed" /> Recently Viewed
          </NavLink>
        </li>
         <li>
          <NavLink
            to="/user/nda-requested"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <img src={icon3} alt="Recently Viewed" /> NDA Requested
          </NavLink>
        </li>
      </ul>
    </div>
  );
}
