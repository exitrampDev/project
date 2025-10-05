import React from "react";
import { NavLink } from "react-router-dom";
import icon1 from "../../../assets/d-icon.png";
import icon2 from "../../../assets/d-icon1.png";
import icon3 from "../../../assets/d-icon2.png";

export default function AdminNav() {
  return (
    <div className="nav__dashboard">
      <ul>
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
            to="/admin/users"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <img src={icon1} alt="Dashboard" /> Users
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/admin/inquiries"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <img src={icon1} alt="Dashboard" /> Inquries
          </NavLink>
        </li>
      </ul>
    </div>
  );
}
