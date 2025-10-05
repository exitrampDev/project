import { useRecoilValue } from "recoil";
import { authState } from "../../recoil/ctaState";
import notifInfo from "../../assets/notifInfo.png";
import serachIcon from "../../assets/serachIcon.png";
import userImg from "../../assets/userImg.png";
import { Routes, Route } from "react-router-dom";
import FreeBuyerDashboard from "./DasboardContentComponents/FreeBuyerComponent";
import FreeSellerDashboard from "./DasboardContentComponents/FreeSellerDashboard";

const DashboardContent = () => {
  const user = useRecoilValue(authState).user;

  return (
    <>
      <div className="dashboard__header_block">
        <h3>{user.user_type} Dashboard</h3>

        <div className="dashboard__header_search_notification_wrap">
          <div className="dashboard__search_field_wrap">
            <input type="text" placeholder="Search" />
            <img src={serachIcon} alt="" />
          </div>
          <div className="dashboard__notification_wrap">
            <button>
              <img src={notifInfo} alt="" />
            </button>
          </div>
          <div className="dashboard__user_wrap">
            <button>
              <img src={userImg} alt="" />
            </button>
          </div>
        </div>
      </div>

      {user?.user_type === "buyer" ? <FreeBuyerDashboard /> : " "}
      {user?.user_type === "seller" ? <FreeSellerDashboard /> : " "}
    </>
  );
};

export default DashboardContent;
