import React from "react";
import notifInfo from "../../../assets/notifInfo.png";
import serachIcon from "../../../assets/serachIcon.png";
import userImg from "../../../assets/userImg.png";

const FlaggedListing = () => { 
    return(
        <>
       <div className="dashboard__header_block mb-4">
        <h3>Flagged Listing</h3>

        <div className="dashboard__header_search_notification_wrap">
          <div className="dashboard__search_field_wrap">
            <input type="text" placeholder="Search" />
            <img src={serachIcon} alt="Search" />
          </div>
          <div className="dashboard__notification_wrap">
            <button>
              <img src={notifInfo} alt="Notification" />
            </button>
          </div>
          <div className="dashboard__user_wrap">
            <button>
              <img src={userImg} alt="User" />
            </button>
          </div>
        </div>
      </div>
        </>
    )
}
export default FlaggedListing;