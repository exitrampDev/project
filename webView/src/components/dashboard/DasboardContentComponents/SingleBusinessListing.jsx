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
import DashboardHeader from "./DashboardHeaderBlock";
import axios from "axios";
import { Dialog } from "primereact/dialog";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";


export default function SingleBusinessListing() {
  const [ndaListingIdAdd, setNdaListingIdAdd] = useRecoilState(ndaListingId);
    const [showNDA, setShowNDA] = useRecoilState(showNDAAtom);
  const navigate = useNavigate();
 const [showImagesPopup, setShowImagesPopup] = useState(false);

 const [additionalImages, setAdditionalImages] = useState([]);
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
    const fetchFiles = async () => {
      try {
        const res = await axios.get(`${API_BASE}/files/${id}`);
        // console.log("datata",res.data);
        setAdditionalImages(res.data || []);
      } catch (err) {
        console.error("Error fetching files:", err);
      }
    };


    fetchFiles();
  }, [id, API_BASE, access_token]);

  const allowedImages = [
  "listingImage1",
  "listingImage2",
  "listingImage3",
  "listingImage4",
  "listingImage5",
];

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
<div className="listing__content_wrap">
  <DashboardHeader headingData="Business Listing"/>
             
      <div className="business__list_single_main_wrap dasb">

          {user?.user_type === "buyer_basic"  && (<>
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

                {/* {user?.user_type === "buyer_basic"  && (<>
                 <Button
          className="business__list_complete_profile_btn"
          onClick={handleCompleteProfile}
        >
          Complete Profile
        </Button>
                </>)} */}
       

        <Button
          className="business__list_submit_nda_btn"
          onClick={() => handleSubmitNDA(business._id)}
        >
          Submit NDA
        </Button>
                </div>

                {/* Conditionally render NDAComponent */}
                {showNDA && <NDASubmit ndaListingIdAdd={ndaListingIdAdd} businessData={business}/>}
            </div>
          </> )}


        <div className="business__list_single_intro_block">
          <div className="business__list_single_intro_block_img_col">
            <img
              src={business.image}
              alt={business.businessName}
              className="w-64 h-64 object-cover rounded-lg mb-4"
            />
            <div
                className="business__lisiting_aditional_images"
                onClick={() => setShowImagesPopup(true)}
                style={{ cursor: "pointer" }}
              >
                view additional images
              </div>

          </div>
          <div className="business__list_single_intro_block_content_col">
            <h2 className="listing__single_title">{business?.businessName ? (<>{business.businessName}</>) : "-"}</h2>
            <div className="listing__single_location">
              <img src={SingleListingLocation} alt="SingleListingLocation" />
              {business?.businessCountry && business.businessState ? (<>{business.businessCountry}, {business.businessState} </>) : "-" }
            </div>
            <div className="listing__single_listingId">
              <span>Listing ID :</span> {business?._id ? (<>#{business._id.toString().slice(-6)}</>) : "-"}
            </div>
            <div className="listing__single_businessOverview">
              {business.businessOverview}
            </div>
            <div className="listing__single_industries">
                {(() => {
                  let industries = [];
                  try {
                    industries = JSON.parse(business?.industry || "[]");
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
            {business?.askingPrice.toLocaleString() }
          </div>
          <div className="busines_lisiting_highLevelSummary_list">
            <strong>Cash Flow:</strong> ${business?.cashFlow.toLocaleString()}
          </div>
          {/* <div className="busines_lisiting_highLevelSummary_list">
            <strong>Revenue:</strong> ${business?.revenue.toLocaleString()}
          </div> */}
          <div className="busines_lisiting_highLevelSummary_list">
            <strong>SDE:</strong> {business?.latestSDE ? (<>{business.latestSDE}</>) : "-"}
          </div>
          <div className="busines_lisiting_highLevelSummary_list">
            <strong>EBITDA:</strong> {business?.latestEBITDA ? (<>{business.latestEBITDA}</>) : "-"}
          </div>
            <div className="busines_lisiting_highLevelSummary_list">
            <strong>Established:</strong> {business?.yearStablished ? (<>{business.yearStablished}</>) : "-"}
          </div>
          
        </div>

        <div className="business__list_single_description_row">
          <h3>Business Description:</h3>
          <div
  className="business__list_single_description_content"
  dangerouslySetInnerHTML={{
    __html: business.listingDescription,
  }}
/>

          <div className="about_listing_toggle">
            <div className="about_listing_toggle_item"><strong>Franchies:</strong> {business?.isFranchise ? "Yes" : "No"}</div>
            <div className="about_listing_toggle_item"><strong>Relocate:</strong>{business?.isRelocatable ? "Yes" : "No"}</div>
            <div className="about_listing_toggle_item"><strong>Startup:</strong>{business?.isStartup ? "Yes" : "No"}</div>
          </div>
        </div>


         <div className="business__list_single_description_row">
          <h3>Addtiional Financial Details</h3>
          <div className="about_listing_toggle">
            <div className="about_listing_toggle_item"><strong>Real Estate:</strong> {business?.realEstateValue ? (<>${business?.realEstateValue}</>) : "-"}</div>
            <div className="about_listing_toggle_item"><strong>Real Estate Included:</strong>{business?.propertyIncludedinAskingPrice ? "Yes" : "No"}</div>
            <div className="about_listing_toggle_item"><strong>ffEValue:</strong>{business?.ffEValue ? (<>${business?.ffEValue}</>) : "-"}</div>
            <div className="about_listing_toggle_item"><strong>FFE Include:</strong>{business?.ffEValueIncludeinAskingPrice ? "Yes" : "No"}</div>
            <div className="about_listing_toggle_item"><strong>Inventory Value:</strong>{business?.inventoryValue ? (<>${business?.inventoryValue}</>) : "-"}</div>
            <div className="about_listing_toggle_item"><strong>Inventory Included: </strong>{business?.inventoryIncludedinAskingPrice ? "Yes" : "No"}</div>
          </div>  
        </div>


        <div className="business__list_single_key_highlights_Business_overview">
          <div className="business__list_single_business_overview">
            <h3 className="m-b-10">Detailed Information</h3>
            <div className="business_list_single_overview_list">
              <strong>Reason for Selling :</strong> {business?.reasonForSelling ? (<>{business.reasonForSelling}</>) : "-" }
            </div>
             <div className="business_list_single_overview_list">
              <strong>Support and Training:</strong> {business?.postCloseSupport ? (<>{business.postCloseSupport}</>) : "-" }
              </div>
             <div className="business_list_single_overview_list">
              <strong>Management Will Stay:</strong>{business?.managementWillingToStay ? (<>{business.managementWillingToStay}</>) : "-" } 
            </div>
             <div className="business_list_single_overview_list">
              <strong>Number of Employees:</strong>{business?.numberOfEmployees ? (<>{business.numberOfEmployees}</>) : "-" } 
            </div>
            <div className="business_list_single_overview_list">
              <strong>Lease Expiration:</strong>{business?.leaseExpiration ? (<>{business.leaseExpiration}</>) : "-" } 
            </div>
            <div className="business_list_single_overview_list">
              <strong>Building SF:</strong>{business?.buildingSF ? (<>{business.buildingSF}</>) : "-" } 
            </div>
            
          </div>
        </div>




      <div className="business__list_single_key_highlights_Business_overview">
          <div className="business__list_single_business_overview">
            <h3 className="m-b-10">Growth and Expansion</h3>
            <div className="business_list_single_overview_list">
              {business?.growthExpansion ? (<> {JSON.parse(business.growthExpansion)}</>) : "-"}   
            </div>
           
          </div>
        </div>


      <div className="business__list_single_key_highlights_Business_overview">
          <div className="business__list_single_business_overview">
            <h3 className="m-b-10">Facility</h3>
            <div className="business_list_single_overview_list">
              {business?.facilityAndLocationDetails ? (<> {business.facilityAndLocationDetails}</>) : "-"}   
            </div>
           
          </div>
        </div>
        

      </div>
</div>

      <Dialog
  header="Additional Images"
  visible={showImagesPopup}
  style={{ width: "70vw", maxWidth: "900px" }}
  onHide={() => setShowImagesPopup(false)}
  modal
  className="additional__image_pop_wrap"
>
  {additionalImages && additionalImages.length > 0 ? (
  <Swiper
    modules={[Navigation, Pagination]}
    navigation
    pagination={{ clickable: true }}
    spaceBetween={20}
    slidesPerView={1}
  >
    {additionalImages
      .filter((img) => {
        const name =
          img?.displayName ||
          img?.filename ||
          img?.fileName ||
          "";

        return allowedImages.some((key) =>
          name.includes(key)
        );
      })
      .map((img, idx) => {
        const src =
          (typeof img === "string" && img) ||
          img?.url ||
          img?.path ||
          img?.fileUrl ||
          img?.filePath ||
          img?.filename;

        const imgName =
          img?.displayName ||
          img?.filename ||
          `listingImage-${idx + 1}`;

        return (
          <SwiperSlide key={idx} className="additional__image_pop">
            <img
              src={`${API_BASE}${src}`}
              alt={imgName}
              className="object-contain"
            />
          </SwiperSlide>
        );
      })}
  </Swiper>
) : (
  <p>No additional images available</p>
)}

</Dialog>

    </>
  );
}
