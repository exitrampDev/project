import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Listings from "./pages/Listings";
import Register from "./components/register";
import Login from "./components/login";
import BusinessListingDetail from "./components/BusinessListingDetail";
import AboutUS from "./pages/AboutUs";
import ContactUs from "./pages/ContactUs";
import TermsCondition from "./pages/TermsCondition";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import Dashboard from "./components/dashboard/dashboard";
import SellerListing from "./components/dashboard/DasboardContentComponents/SellerListing";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import DashboardContent from "./components/dashboard/dashboardContent";
import AdminUsersShow from "./components/dashboard/AdminContent/AdminUserShow";
import ProfileFormBuyer from "./components/dashboard/DasboardContentComponents/FreeBuyerProfileForm";
import MySaveListing from "./components/dashboard/DasboardContentComponents/MySaveListing";
import RecentViewListing from "./components/dashboard/DasboardContentComponents/RecentViewListing";
import FreeSellerForm from "./components/dashboard/DasboardContentComponents/FreeSellerProfile";
import CimView from "./components/dashboard/DasboardContentComponents/CimView";
import SingleBusinessListing from "./components/dashboard/DasboardContentComponents/SingleBusinessListing";
import NDARequested from "./components/dashboard/DasboardContentComponents/NDARequested";

import BuyerSubmissionRequest from "./components/dashboard/DasboardContentComponents/BuyerSubmissionRequest";
import DocumentRoom from "./components/dashboard/DasboardContentComponents/DoocumentRoom";
import DocumentRoomBuyer from "./components/dashboard/DasboardContentComponents/DocumentRoomBuyer";
import CreateCIM from "./components/dashboard/DasboardContentComponents/CreateCIM";


const App = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/listings" element={<Listings />} />
        <Route path="/aboutus" element={<AboutUS />} />
        <Route path="/contactus" element={<ContactUs />} />
        <Route path="/termscondition" element={<TermsCondition />} />
        <Route path="/privacypolicy" element={<PrivacyPolicy />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/listing/:id" element={<BusinessListingDetail />} />
        {/* dashboard pages */}
        {/* <Route path="user/dashboard" element={<Dashboard />} />
        <Route path="user/saved-listing" element={<Dashboard />} />
        <Route path="user/my-listing" element={<Dashboard />} />
        <Route path="user/recently-viewed" element={<Dashboard />} /> */}

        <Route path="user" element={<Dashboard />}>
          <Route path="dashboard" element={<DashboardContent />} />
          <Route path="saved-listing" element={<div>Saved Listing</div>} />
          <Route path="my-listing" element={<SellerListing />} />
          <Route path="document-room/:id" element={<DocumentRoom/>} />
          <Route path="document-room-buyer/:id" element={<DocumentRoomBuyer/>} />
          <Route path="single-listing/:id" element={<SingleBusinessListing />} />
          <Route path="create-cim/:id" element={<CreateCIM/>} />
          <Route path="cim/:id" element={<CimView/>} />
          <Route
            path="complete-profile-buyer-free"
            element={<ProfileFormBuyer />}
          />
           <Route
            path="nda-requested"
            element={<NDARequested />}
          />
          <Route
            path="complete-profile-seller"
            element={<FreeSellerForm />}
          />
          <Route
            path="recent-view-listing"
            element={<RecentViewListing />}
          />
           <Route
            path="buyer-submission"
            element={<BuyerSubmissionRequest />}
          />
          
          <Route path="my-save-listing" element={<MySaveListing />} />
        </Route>
        <Route path="admin" element={<Dashboard />}>
          <Route path="users" element={<AdminUsersShow />} />
          <Route path="inquiries" element={"inquiries are here!"} />
        </Route>
      </Routes>
    </>
  );
};

export default App;
