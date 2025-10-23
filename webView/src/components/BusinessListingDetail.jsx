import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Card } from "primereact/card";
import { ProgressSpinner } from "primereact/progressspinner";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { authState,apiBaseUrlState } from "../recoil/ctaState";
import ArrowIcon from "../assets/arrowIcon.png";
import SingleListingLocation from "../assets/singleListingLocation.png";

import { Divider } from "primereact/divider";
import { Tag } from "primereact/tag";
import { Chip } from "primereact/chip";

export default function BusinessListingDetail() {
  const { user, access_token } = useRecoilValue(authState) ?? {};
  const { id } = useParams();
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const API_BASE = useRecoilValue(apiBaseUrlState);
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
          body: JSON.stringify({ businessId: id }), // ✅ correct payload
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
      <Header />
      <div className="breadcrubs__main_container">
        <Link to={`/`} className="">
          Home
        </Link>
        /
        <Link to={`/listings/`} className="">
          Business for sale
        </Link>
        / Business listing details
      </div>

    

      <div className="business__list_single_main_wrap">
       
       
               <div className="business__list_single_intro_block">
                 <div className="business__list_single_intro_block_img_col">
                   <img
                     src={business.image}
                     alt={business.businessName}
                     className="w-64 h-64 object-cover rounded-lg mb-4"
                   />
                 </div>
                 <div className="business__list_single_intro_block_content_col">
                   <h2 className="listing__single_title">{business?.businessName ? (<>{business.businessName}</>) : "-"}</h2>
                   <div className="listing__single_location">
                     <img src={SingleListingLocation} alt="SingleListingLocation" />
                     {business?.businessCity && business.businessState ? (<>{business.businessCity}, {business.businessState} </>) : "-" }
                   </div>
                   <div className="listing__single_listingId">
                     <span>Listing ID :</span> {business?._id ? (<>#{business._id}</>) : "-"}
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
                 <div className="busines_lisiting_highLevelSummary_list">
                   <strong>Revenue:</strong> ${business?.revenue.toLocaleString()}
                 </div>
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
                 <div className="business__list_single_description_content">{business.listingDescription}</div>
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



        <div className="UpgradeFree_when_ready_wrap">
        <div className="UpgradeFree_when_ready_container">
          <h3>
            <span>Interested?</span> Create a Buyer Profile to Get Started
          </h3>
          <p>
            Create a free buyer profile to submit NDAs, unlock seller documents,
            and connect with businesses ready to talk.
          </p>
          <button
            className="UpgradeFree_when_ready_btn"
            onClick={handleNonUserClick}
          >
            Create Buyer Profile <img src={ArrowIcon} alt="ArrowIcon" />
          </button>
        </div>
      </div>
      <Footer />
    </>
  );
}
