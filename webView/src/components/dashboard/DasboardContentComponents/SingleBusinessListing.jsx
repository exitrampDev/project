import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Card } from "primereact/card";
import { ProgressSpinner } from "primereact/progressspinner";
import { Link } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { authState,apiBaseUrlState,showNDAAtom,ndaListingId } from "../../../recoil/ctaState";
import ArrowIcon from "../../../assets/arrowIcon.png";
import SingleListingLocation from "../../../assets/singleListingLocation.png";
import { Button } from "primereact/button";
import serachIcon from "../../../assets/serachIcon.png";
import notifInfo from "../../../assets/notifInfo.png";
import userImg from "../../../assets/userImg.png";  
import { Divider } from "primereact/divider";
import { Tag } from "primereact/tag";
import { Chip } from "primereact/chip";
import { useNavigate } from "react-router-dom";
import NDASubmit from "../DasboardContentComponents/NdaSubmit";
import { useRecoilState } from "recoil";

export default function SingleBusinessListing() {
  const [ndaListingIdAdd, setNdaListingIdAdd] = useRecoilState(ndaListingId);
    const [showNDA, setShowNDA] = useRecoilState(showNDAAtom);
  const navigate = useNavigate();
 

  const { user, access_token } = useRecoilValue(authState) ?? {};
  const API_BASE = useRecoilValue(apiBaseUrlState);
  const { id } = useParams();
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
   const handleCompleteProfile = () => {
    navigate("/user/complete-profile-buyer-free");
  };
  const handleSubmitNDA = (id) => {
    setShowNDA(true);
    setNdaListingIdAdd(id);
  };
  const handleNonUserClick = () => {
    const signupBtn = document.querySelector(".signup-btn");
    if (signupBtn) signupBtn.click();
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Save favorite
        const response = await fetch(`${API_BASE}/recently`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ businessId: id }), 
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const favData = await response.json();
        console.log("Favorite saved:", favData);
      } catch (error) {
        console.error("Error saving favorite:", error);
      }

      try {
        // Fetch business detail
        const res = await fetch(`${API_BASE}/business-listing/${id}`);
        const data = await res.json();
        setBusiness(data);
      } catch (err) {
        console.error("Error fetching business:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) return <ProgressSpinner />;
  if (!business) return <p>Business not found</p>;

  return (
    <>
     <div className="dashboard__header_block">
                <h3 className="heading__Digital_CIM">Business Listing</h3>
        
                <div className="dashboard__header_search_notification_wrap">
                  <div className="dashboard__search_field_wrap">
                    <input type="text" placeholder="Search" />
                    <img src={serachIcon} alt="search" />
                  </div>
                  <div className="dashboard__notification_wrap">
                    <button>
                      <img src={notifInfo} alt="notifications" />
                    </button>
                  </div>
                  <div className="dashboard__user_wrap">
                    <button>
                      <img src={userImg} alt="user" />
                    </button>
                  </div>
                </div>
              </div>


             
      <div className="business__list_single_main_wrap dasb">

          {user?.user_type === "buyer"  && (<>
            <div className="business__list_single_nda_submit_row">
              <div className="business__list_single_nda_submit_row_intro_head_copy">
                <h2 className="business__list_single_nda_submit_row_intro_head">
                  🔒 Confidential Information Memorandum (CIM)
                </h2>
                <p className="business__list_single_nda_submit_row_body_copy">
                  To access this CIM, please complete your buyer profile and submit an NDA.
                </p>
              </div>
              <div className="business__list_single_nda_submit_row_intro_btns">
        <Button
          className="business__list_complete_profile_btn"
          onClick={handleCompleteProfile}
        >
          Complete Profile
        </Button>

        <Button
          className="business__list_submit_nda_btn"
          onClick={() => handleSubmitNDA(business._id)}
        >
          Submit NDA
        </Button>
                </div>

                {/* Conditionally render NDAComponent */}
                {showNDA && <NDASubmit ndaListingIdAdd={ndaListingIdAdd} />}
            </div>
          </> )}


        <div className="business__list_single_intro_block">
          <div className="business__list_single_intro_block_img_col">
            <img
              src={business.image}
              alt={business.businessName}
              className="w-64 h-64 object-cover rounded-lg mb-4"
            />
          </div>
          <div className="business__list_single_intro_block_content_col">
            <h2 className="listing__single_title">{business.businessName}</h2>
            <div className="listing__single_location">
              <img src={SingleListingLocation} alt="SingleListingLocation" />
              {business.city}, {business.state}
            </div>
            <div className="listing__single_listingId">
              <span>Listing ID :</span> #{business._id}
            </div>
            <div className="listing__single_businessOverview">
              {business.businessOverview}
            </div>
            <div className="listing__single_industries">
                {(() => {
                  let industries = [];
                  try {
                    industries = JSON.parse(business.industry || "[]");
                  } catch {
                    industries = [];
                  }

                  return industries.map((ind, idx) => (
                    <Chip key={idx} label={ind} />
                  ));
                })()}
              </div>

          </div>
        </div>
        <div className="business__list_single_highLevelSummary">
          <h3>High-Level Summary</h3>

          <div className="busines_lisiting_highLevelSummary_list">
            <strong>Asking Price:</strong> $
            {business.askingPrice.toLocaleString()}
          </div>
          <div className="busines_lisiting_highLevelSummary_list">
            <strong>Cash Flow:</strong> ${business.cashFlow.toLocaleString()}
          </div>

          <div className="busines_lisiting_highLevelSummary_list">
            <strong>Industry: </strong>
            <span>
               {(() => {
                  let industries = [];
                  try {
                    industries = JSON.parse(business.industry || "[]");
                  } catch {
                    industries = [];
                  }

                  return industries.map((ind, idx) => (
                    <Chip key={idx} label={ind} />
                  ));
                })()}
            </span>
          </div>

          <div className="busines_lisiting_highLevelSummary_list">
            <strong>Business Type:</strong> {business.businessType}
          </div>
          <div className="busines_lisiting_highLevelSummary_list">
            <strong>Entity Type:</strong> {business.entityType.toUpperCase()}
          </div>
          <div className="busines_lisiting_highLevelSummary_list">
            <strong>Established:</strong> {business.yearStablished}
          </div>
          <div className="busines_lisiting_highLevelSummary_list">
            <strong>Revenue:</strong> ${business.revenue.toLocaleString()}
          </div>
        </div>

        <div className="business__list_single_description_row">
          <h3>Business Description:</h3>
          <div className="business__list_single_description_content">{business.listingDescription}</div>
        </div>


        <div className="business__list_single_key_highlights_Business_overview">
          <div className="business__list_single_key_highlights_col">
            <h3>Key Highlights</h3>
            {JSON.parse(business.keyHighlights || "[]")?.map((ind, idx) => (
              <span key={idx}> {ind} </span>
            ))}
          </div>
          <div className="business__list_single_business_overview">
            <h3>Business Overview:</h3>
            <div className="business_list_single_overview_list">
              <strong>Employees:</strong> {business.numberOfEmployees}
            </div>
             <div className="business_list_single_overview_list">
              <strong>Location:</strong> {business.city}, {business.state}
            </div>
             <div className="business_list_single_overview_list">
              <strong>Legal Entity:</strong> {business.entityType}
            </div>
          </div>
        </div>
      </div>


    </>
  );
}
