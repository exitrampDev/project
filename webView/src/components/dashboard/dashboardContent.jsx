import { useRecoilValue } from "recoil";
import { authState } from "../../recoil/ctaState";
import notifInfo from "../../assets/notifInfo.png";
import serachIcon from "../../assets/serachIcon.png";
import userImg from "../../assets/userImg.png";
import { Routes, Route } from "react-router-dom";
import FreeBuyerDashboard from "./DasboardContentComponents/FreeBuyerComponent";
import FreeSellerDashboard from "./DasboardContentComponents/FreeSellerDashboard";
import DashboardHeader from "./DasboardContentComponents/DashboardHeaderBlock";
import AdminDashboard from "./AdminContent/AdminDashboard";
import SellerCentralDasboard from "./DasboardContentComponents/SellerCentralDashboard";

const DashboardContent = () => {
  const user = useRecoilValue(authState).user;

  return (
    <>
      <DashboardHeader headingData={`${user.user_type} Dashboard`}/>
      {user?.user_type === "buyer_basic" ? <FreeBuyerDashboard /> : " "}
      {user?.user_type === "seller_basic" ? <FreeSellerDashboard /> : " "}
      {user?.user_type === "seller_listing" ? <FreeSellerDashboard /> : " "}
      {user?.user_type === "seller_central" ? <SellerCentralDasboard /> : " "}
      {user?.user_type === "admin" ? <AdminDashboard /> : " "}
    </>
  );
};

export default DashboardContent;
