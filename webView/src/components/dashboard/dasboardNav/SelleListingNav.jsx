import React from "react";
import { NavLink } from "react-router-dom";
import icon1 from "../../../assets/d-icon.png";
import icon2 from "../../../assets/d-icon1.png";
import icon3 from "../../../assets/d-icon2.png";

export default function SellerListingNav() {
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
               to="/user/buyer-submission"
               className={({ isActive }) => (isActive ? "active" : "")}
             >
               <img src={icon2} alt="Buyer Submission" /> Buyer Submission
             </NavLink>
           </li>
<li>
             <NavLink
               to="/user/my-listing"
               className={({ isActive }) => (isActive ? "active" : "")}
             >
               <img src={icon2} alt="My Listing" /> My Listing
             </NavLink>
           </li>
           
           <li>
             <NavLink
               to="/user/complete-profile-seller-free"
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
         </ul>
       </div>
  );
}
