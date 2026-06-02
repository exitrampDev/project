import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Listings from "./pages/Listings";
import Pricing from "./pages/Pricing";
import Register from "./components/register";
import Login from "./components/login";
import BusinessListingDetail from "./components/BusinessListingDetail";
import AboutUS from "./pages/AboutUs";
import Broker from "./pages/Broker";
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
import DueDiligence from "./components/dashboard/DasboardContentComponents/DueDiligence";
import FlaggedListing from "./components/dashboard/AdminContent/FlaggedListing";
import UserNotifications from "./components/dashboard/DasboardContentComponents/UserNotifications";
import PaymentProcess from "./components/dashboard/DasboardContentComponents/PaymentProcess";
import SuccessPayment from "./components/dashboard/DasboardContentComponents/SuccessPayment";
import PaymentHistory from "./components/dashboard/DasboardContentComponents/PymentHistory";
import UserPaymentHistory from "./components/dashboard/AdminContent/UsersPaymentsHistory";
import EditBusineddListing from "./components/dashboard/DasboardContentComponents/EditBusineddListing";
import BrokerProfile from "./components/dashboard/DasboardContentComponents/BrokerProfile";
import NotFound from "./components/NotFound";
import PagesList from "./components/dashboard/AdminContent/PagesList";
import PageBuilder from "./components/dashboard/AdminContent/PageBuilder";
import BlogPostList from "./components/dashboard/AdminContent/BlogPostList";
import BlogPostBuilder from "./components/dashboard/AdminContent/BlogPostBuilder";
import RenderPages from "./pages/RenderPages";
import InviteTeam from "./components/dashboard/DasboardContentComponents/InviteTeam";
import RegisterInvitedPerson from "./components/registerInvitedPerson";
import InvitedDataListing from "./components/dashboard/DasboardContentComponents/invitedDataListing";
import RenderBlogPost from "./pages/RenderBlogPost";
import RenderBlogList from "./pages/RenderBlogList";
import FindABroker from "./pages/FindABroker";
import BrokerSingleView from "./pages/BrokerSignleView";

const App = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/listings" element={<Listings />} />
        <Route path="/find-broker" element={<FindABroker />} />
        <Route path="/aboutus" element={<AboutUS />} />
        <Route path="/pricing" element={<Pricing/>} />
        <Route path="/broker" element={<Broker />} />
        <Route path="/broker/:id" element={<BrokerSingleView />} />
        <Route path="/contactus" element={<ContactUs />} />
        <Route path="/termscondition" element={<TermsCondition />} />
        <Route path="/privacypolicy" element={<PrivacyPolicy />} />
        <Route path="/register" element={<Register />} />
        <Route path="/register-invited" element={<RegisterInvitedPerson />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/page/:slug" element={<RenderPages />} />
        <Route path="/insight" element={<RenderBlogList />} />
        <Route path="/insight/:slug" element={<RenderBlogPost />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/verify-email/" element={<ResetPassword />} />
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
          <Route path="invite-team" element={<InviteTeam />} />
          <Route path="my-invited-listing" element={<InvitedDataListing />} />
          <Route path="document-room/:id" element={<DocumentRoom/>} />
          <Route path="document-room-buyer/:id" element={<DocumentRoomBuyer/>} />
          <Route path="single-listing/:id" element={<SingleBusinessListing />} />
           <Route path="edit-listing/:id" element={<EditBusineddListing />} />
          <Route path="notifications/:id" element={<UserNotifications/>} />
          <Route path="create-cim/:id" element={<CreateCIM/>} />
          <Route path="cim/:id" element={<CimView/>} />
          <Route path="due-diligence/:id" element={<DueDiligence/>} />
          <Route path="payment-process/:type/:id" element={<PaymentProcess />} />
          <Route
            path="complete-profile-buyer-free"
            element={<ProfileFormBuyer />}
          />
           <Route
            path="payment-history"
            element={<PaymentHistory/>}
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
            path="broker-profile"
            element={<BrokerProfile />}
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
           <Route path="users-payments" element={<UserPaymentHistory />} />
          <Route path="inquiries" element={<FlaggedListing/>} />
           <Route path="pages" element={<PagesList />} />
          <Route path="pages/create" element={<PageBuilder />} />
          <Route path="pages/:slug" element={<PageBuilder />} />
          <Route path="insight" element={<BlogPostList />} />
          <Route path="insight/create" element={<BlogPostBuilder />} />
          <Route path="insight/:slug" element={<BlogPostBuilder />} />
        </Route>
        <Route path="payment" element={<Dashboard />}>
          <Route path="success" element={<SuccessPayment />} />
        </Route>
      </Routes>
    </>
  );
};

export default App;
