import { useState } from "react";
import { useRecoilValue } from "recoil";
import { Navigate, Outlet } from "react-router-dom";

import { authState } from "../../recoil/ctaState";
import DashboardSidebar from "./DashboardSidebar";
import mobileLogo from "../../assets/mobile-Bar-logo.png";

const Dashboard = () => {
  const user = useRecoilValue(authState).user;
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen((previousState) => !previousState);
  };

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div
      className={`dashboard__main_wrap ${
        isMobileSidebarOpen ? "MobileSideBarOpen" : ""
      }`}
    >
      <div className="mobile_logo_col_sidebar hideOnDesktop">
        <button
          type="button"
          className="mobile_sidebar_toggle"
          onClick={toggleMobileSidebar}
          aria-label={
            isMobileSidebarOpen
              ? "Close dashboard sidebar"
              : "Open dashboard sidebar"
          }
          aria-expanded={isMobileSidebarOpen}
        >
          <img src={mobileLogo} alt="" />
        </button>
      </div>

      {isMobileSidebarOpen && (
        <button
          type="button"
          className="mobile_sidebar_overlay hideOnDesktop"
          onClick={closeMobileSidebar}
          aria-label="Close dashboard sidebar"
        />
      )}

      <aside className="dashboard__sidebar_wrap dashboard_mobrile_sidebar">
        <DashboardSidebar onNavigate={closeMobileSidebar} />
      </aside>

      <main className="dasboard__content_container_wrap">
        <Outlet />
      </main>
    </div>
  );
};

export default Dashboard;