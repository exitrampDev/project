import React from "react";
import { Link } from "react-router-dom";
import icon1 from "../../../assets/d-icon.png";
import icon2 from "../../../assets/d-icon1.png";
import icon3 from "../../../assets/d-icon2.png";

export default function SellerFreeNav() {
  return (
    <div className="nav__dahboard">
      <ul>
         <li>
             <NavLink
               to="/"
               className={({ isActive }) => (isActive ? "active" : "")}
             >
               <img src={icon1} alt="Dashboard" /> Web View
             </NavLink>
           </li>
        <li>
          <Link to="/dashboard">
            <img src={icon1} alt="-" /> Dashboard
          </Link>
        </li>
        <li>
          <Link to="/listings">
            <img src={icon3} alt="-" />
            My Listing
          </Link>
        </li>
        <li>
          <Link to="/listings">
            <img src={icon2} alt="-" />
            Saved Listing
          </Link>
        </li>
        <li>
          <Link to="/listings">
            <img src={icon3} alt="-" />
            Recently Viewed
          </Link>
        </li>
      </ul>
    </div>
  );
}
