import { Dropdown } from "primereact/dropdown"
import React from "react"
import notifInfo from "../../../assets/notifInfo.png";
import serachIcon from "../../../assets/serachIcon.png";
import userImg from "../../../assets/userImg.png";
import { Link } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { authState } from "../../../recoil/ctaState";

const DashboardHeader = ({headingData}) => {
  const user = useRecoilValue(authState).user;
    return(
        <>
        <div className="dashboard__header_block">
        <h3>{headingData}</h3>
        <div className="dashboard__header_search_notification_wrap">
          <div className="dashboard__search_field_wrap hideOnMobile">
            {/* <input type="text" placeholder="Search" /> */}
            <img src={serachIcon} alt="Search" />
          </div>
          <div className="dashboard__notification_wrap">
            <button>
             <Link to={`/user/notifications/${user._id}`}>
              <img src={notifInfo} alt="Notifications" />
             </Link>
            </button>
          </div>
          <div className="dashboard__user_wrap">
{user?.user_type === "seller_broker" ? <>
<button>
              

               <Link to={`/user/broker-profile`}>
               <img src={userImg} alt="User" />
               </Link>
              
            </button>
</> : ""}


{(user?.user_type === "seller_central" || user?.user_type === "seller_listing") ? <>
<button>
           <Link to={`/user/complete-profile-seller`}>
               <img src={userImg} alt="User" />
               </Link>     
              
            </button>
</> : ""}
{user?.user_type === "buyer_basic" ? <>
<button>
              

               <Link to={`/user/complete-profile-buyer-free`}>
               <img src={userImg} alt="User" />
               </Link>
              
            </button>
</> : ""}
            
          </div>
        </div>
      </div>
        </>
    )
}
export default DashboardHeader