import React from "react";
import { NavLink } from "react-router-dom";
import icon1 from "../../../assets/d-icon.png";
import icon2 from "../../../assets/d-icon1.png";
import icon3 from "../../../assets/d-icon2.png";
import icon21 from "../../../assets/icon21.png";
import icon22 from "../../../assets/icon22.png";
import icon23 from "../../../assets/icon23.png";
import invite from "../../../assets/invite.png";
import icon24 from "../../../assets/icon24.png";
import icon25 from "../../../assets/icon25.png";
import icon26 from "../../../assets/icon26.png";
import icon27 from "../../../assets/icon27.png";
import icon28 from "../../../assets/icon28.png";
import { useRecoilValue } from "recoil";
import { authState } from "../../../recoil/ctaState";
import msgIcon from "../../../assets/msgIcon.png";

export default function SellerPremiumNav() {

const { user, access_token } = useRecoilValue(authState) ?? {};

  
  return (
  
   <div className="nav__dashboard">
           <ul>
               <li>
               <NavLink
                 to="/"
                 className={({ isActive }) => (isActive ? "active" : "")}
               >
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
                to="/user/invite-team"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                <img src={invite} alt="Invite Team" /> Invite Team
              </NavLink>
            </li>
            <li>
               <NavLink
                 to="/user/chatbox"
                 className={({ isActive }) => (isActive ? "active" : "")}
               >
                 <img src={msgIcon} alt="My Listing" />  Message Center
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
                 to="/user/my-listing"
                 className={({ isActive }) => (isActive ? "active" : "")}
               >
                 <img src={icon23} alt="My Listing" /> My Listing
               </NavLink>
             </li>
              <li>
               <NavLink
                 to="/user/buyer-submission"
                 className={({ isActive }) => (isActive ? "active" : "")}
               >
                 <img src={icon24} alt="Buyer Submission" /> Buyer Submission
               </NavLink>
             </li>
             <li>
               <NavLink
                 to="/user/payment-history"
                 className={({ isActive }) => (isActive ? "active" : "")}
               >
                 <img src={icon25} alt="My Listing" /> Payment History
               </NavLink>
             </li>

        {user?.user_type === "seller_broker" && (<>
        
             <li>
               <NavLink
                 to="/user/broker-profile"
                 className={({ isActive }) => (isActive ? "active" : "")}
               >
                 <img src={icon28} alt="My Listing" /> Broker Profile
               </NavLink>
             </li>
        
        </> )}



         {(user?.user_type === "seller_central") && (<>
        
             <li>
               <NavLink
                 to="/user/complete-profile-seller"
                 className={({ isActive }) => (isActive ? "active" : "")}
               >
                 <img src={icon28} alt="My Listing" /> My Profile
               </NavLink>
             </li>
        
        </> )}

  {(user?.user_type === "seller_individual")  && (<>
        
             <li>
               <NavLink
                 to="/user/complete-profile-seller"
                 className={({ isActive }) => (isActive ? "active" : "")}
               >
                 <img src={icon28} alt="My Listing" /> My Profile
               </NavLink>
             </li>
             
        
        </> )}

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
                 to="/user/tickets"
                 className={({ isActive }) => (isActive ? "active" : "")}
               >
                 <img src={icon25} alt="My Listing" />   Support Tickets
               </NavLink>
             </li>

             


           </ul>
         </div>
)
}
