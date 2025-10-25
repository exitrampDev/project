import React from "react";

export default function SellerPremiumNav() {
  return <div className="nav__dashboard">
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
               to="/user/complete-profile-seller"
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
       </div>;
}
