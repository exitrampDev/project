import { Dropdown } from "primereact/dropdown"
import React from "react"
import notifInfo from "../../../assets/notifInfo.png";
import serachIcon from "../../../assets/serachIcon.png";
import userImg from "../../../assets/userImg.png";

const DashboardHeaderAdmin = ({headingData}) => {
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
              <img src={notifInfo} alt="Notifications" />
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
export default DashboardHeaderAdmin