import { useParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { ProgressSpinner } from "primereact/progressspinner";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { authState,apiBaseUrlState } from "../recoil/ctaState";
import ArrowIcon from "../assets/arrowIcon.png";
import SingleListingLocation from "../assets/singleListingLocation.png";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Dialog } from "primereact/dialog";
import { Divider } from "primereact/divider";
import { Tag } from "primereact/tag";
import { Chip } from "primereact/chip";
import { Toast } from "primereact/toast";
import axios from "axios";
import { InputTextarea } from "primereact/inputtextarea";
import { InputText } from "primereact/inputtext";
import { InputMask } from "primereact/inputmask";

export default function BusinessListingDetail() {
  const { user, access_token } = useRecoilValue(authState) ?? {};
  const { id } = useParams();
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
   const toast = useRef(null);
    const [favoriteIds, setFavoriteIds] = useState([]);
    const [favoriteIdsCurrent, setFavoriteIdsCurrent] = useState([]);
  const [showImagesPopup, setShowImagesPopup] = useState(false);
  const API_BASE = useRecoilValue(apiBaseUrlState);
  const [showContactModal, setShowContactModal] = useState(false);
const [contactForm, setContactForm] = useState({
  senderEmail: user?.email || "",
  fullName: "",
  phone: "",
  zipCode: "",
  amountToInvest: "",
  details: "",
});

const [sending, setSending] = useState(false);

  const handleNonUserClick = () => {
    const signupBtn = document.querySelector(".signup-btn");
    if (signupBtn) signupBtn.click();
  };
  const [additionalImages, setAdditionalImages] = useState([]);
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
        // console.log("Favorite saved:", favData);
      } catch (error) {
        console.error("Error saving favorite:", error);
      }

      try {
        // Fetch business detail
        const res = await fetch(`${API_BASE}/business-listing/${id}`);
        const data = await res.json(); 
        // console.log("Business data:", data); 
        setBusiness(data);
      } catch (err) {
        console.error("Error fetching business:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

const fetchFilesMain = async () => {
      try {
        const res = await axios.get(`${API_BASE}/files/${id}`);
        // console.log("datata",res.data);
        setAdditionalImages(res.data || []);
      } catch (err) {
        console.error("Error fetching files:", err);
      }
    };


    fetchFilesMain();

  }, [id]);
useEffect(() => {
  if (!access_token) return;

  const fetchFavorites = async () => {
    try {
      const res = await fetch(`${API_BASE}/favorite`, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });

      const result = await res.json();

      // assuming result.data = [{ businessId: "..." }]
      const ids = result.data.map(fav => fav.businessId._id);
      setFavoriteIds(ids);
      const idsCurrent = result.data.map(fav => fav);
      setFavoriteIdsCurrent(idsCurrent);
    } catch (err) {
      console.error("Failed to fetch favorites", err);
    }
  };

  fetchFavorites();
}, [access_token]);
  if (loading) return <ProgressSpinner />;
  if (!business) return <p>Business not found</p>;

const renderMoney = (value) => {
  if (value === "" || value === null || value === undefined || value === 0) return "-";
  return `$${value}`;
};

const renderYesNo = (value) => {
  if (value === "" || value === null || value === undefined) return "-";
  if (value === true || value === "true" || value === "yes" ) return "Yes";
  if (value === false || value === "false" || value === "no") return "No";
  
  return "-";
};
// console.log("Business owner data>>>>>", business?.ownerId);
const allowedImages = [
  "listingImage1",
  "listingImage2",
  "listingImage3",
  "listingImage4",
  "listingImage5",
];
const removeFavorite = async (favoriteIdsCurrent, businessId) => {
  // console.log("Current favorites in state:", favoriteIdsCurrent);
  // console.log("Business ID to remove:", businessId);
  const favoriteObj = favoriteIdsCurrent.find(
    (fav) => fav?.businessId?._id === businessId
  );

  const favoriteId = favoriteObj?._id;
// console.log("Attempting to remove favorite with ID:", favoriteId);
  if (!favoriteId){
     toast.current.show({
      severity: "error",
      summary: "Multiple Attempts Detected ",
      detail: "Multiple attempts were made to add or remove this listing from favorites.",
      life: 2500,
    });
    return;
  } 

  try {
    const res = await fetch(`${API_BASE}/favorite/${favoriteId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) throw new Error("Failed to remove favorite");

    // ✅ REMOVE FROM LOCAL STATES (this triggers re-render)
    setFavoriteIds((prev) => prev.filter((id) => id !== businessId));
    setFavoriteIdsCurrent((prev) =>
      prev.filter((fav) => fav?._id !== favoriteId)
    );

    toast.current.show({
      severity: "info",
      summary: "Removed",
      detail: "Listing removed from favorites.",
      life: 2500,
    });
  } catch (err) {
    console.error("Error removing favorite:", err);

    toast.current.show({
      severity: "error",
      summary: "Error",
      detail: "Failed to remove favorite.",
      life: 3000,
    });
  }
};
  const handleContactSeller = async (e) => {
  e.preventDefault();

  try {
    setSending(true);

    await axios.post(`${API_BASE}/business-listing/contact-seller`, {
      senderEmail: contactForm.senderEmail,
      businessId: id,
      fullName: contactForm.fullName,
      phone: contactForm.phone,
      zipCode: contactForm.zipCode,
      amountToInvest: contactForm.amountToInvest,
      details: contactForm.details,
    });

    toast.current.show({
      severity: "success",
      summary: "Message Sent",
      detail: "Your message has been sent to the seller.",
      life: 3000,
    });

    setContactForm({
      senderEmail: user?.email || "",
      fullName: "",
      phone: "",
      zipCode: "",
      amountToInvest: "",
      details: "",
    });
    setShowContactModal(false);
  } catch (error) {
    toast.current.show({
      severity: "error",
      summary: "Error",
      detail: "Failed to send message. Please try again.",
      life: 3000,
    });
  } finally {
    setSending(false);
  }
};

const saveListingBtn = (businessId) => {
 

  if (access_token) {
    // --- Save Favorite ---
   const handleSave = async () => {
  try {
    const response = await fetch(`${API_BASE}/favorite`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ businessId }),
    });

    const data = await response.json();
// console.log("Favorite response:", data);
    // ✅ add to local state instantly
    setFavoriteIds(prev => [...prev, businessId]);
    toast.current.show({
      severity: "success",
      summary: "Added to Favorites",
      detail: "This listing has been added to your favorites.",
      life: 3000,
    });
  } catch (error) {
    toast.current.show({
      severity: "error",
      summary: "Error",
      detail: "Failed to save favorite.",
      life: 3000,
    });
  }
};


const markFlag = async () => {

      const confirmFlag = window.confirm(
      "Are you sure you want to flag this listing as suspicious?"
    );

    if (!confirmFlag) return;

      try {
        const payload = {
          description: "This business is suspicious",
          businessId,
        };

        const response = await fetch(`${API_BASE}/flag`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Flag created:", data);

        toast.current.show({
          severity: "warn",
          summary: "Business Flagged",
          detail: "This business has been flagged for review.",
          life: 3000,
        });
      } catch (error) {
        console.error("Error flagging business:", error);
        toast.current.show({
          severity: "error",
          summary: "Error",
          detail: "Failed to flag this business. Please try again.",
          life: 3000,
        });
      }
    };
    const isFavorite = favoriteIds.includes(businessId);
    // console.log("isFavorite>>>>>", favoriteIds);
    return (
      <>
      <Toast ref={toast} position="top-right" />
        {isFavorite ? 
              
              
              <Button
              icon="pi pi-heart-fill"
              className="button__save_listing_global active"
              onClick={() => removeFavorite(favoriteIdsCurrent,businessId)}
              />
              
              : 
              
              <Button
              icon="pi pi-heart"
              className="button__save_listing_global"
              onClick={handleSave}
              />
              }
       <div className="flag__hit_list_inner_listing" onClick={markFlag}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 512 512"
            fill="#002F68"
          >
            <path d="M64 32v448h32V288h320l-96-128 96-128H64z" />
          </svg>
        </div>
      </>
    );
  }

  const handleNonUserClick = () => {
    const signupBtn = document.querySelector(".signup-btn");
    if (signupBtn) signupBtn.click();
  };

  return (
    <Button
      icon="pi pi-heart"
      className="button__save_listing_non_user"
      onClick={handleNonUserClick}
    />
  );
};
  

  return (
    <>
    <Toast ref={toast} position="top-right" />
      <Header />
   <div className="business__listing_content">
     
      <div className="header__wrap_listing">
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


{business?.ownerId?.user_type === "seller_broker" ? <>

 <div className="bussiness__contact_form_seller_wrap">
          <Button
            label="Contact Listing Broker"
            icon="pi pi-envelope"
            className="contact__seller_btn"
            onClick={() => {
              
              setShowContactModal(true);
            }}
          />
        </div>
</> : <>
        <div className="bussiness__contact_form_seller_wrap">
          <Button
            label="Contact Listing Owner"
            icon="pi pi-envelope"
            className="contact__seller_btn"
            onClick={() => {
              
              setShowContactModal(true);
            }}
          />
        </div>


</>}



      </div>
    

      <div className="business__list_single_main_wrap web__view_wrapper">
       
       


               <div className="business__list_single_intro_block">
                 <div className="business__list_single_intro_block_img_col">
                   <img
                     src={business.image}
                     alt={business.listingTitle}
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
                   <h2 className="listing__single_title">{business?.listingTitle ? (<>{business.listingTitle}</>) : "-"}</h2>
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
               
                    <div className="list__action_inns">{saveListingBtn(business._id)}</div>

                 
               </div>
               <div className="business__list_single_highLevelSummary">
                 <h3>High-Level Summary</h3>
       
                 <div className="busines_lisiting_highLevelSummary_list">
                   <strong>Asking Price:</strong> $
                   {business?.askingPrice.toLocaleString() }
                 </div>
                 <div className="busines_lisiting_highLevelSummary_list">
                  <strong>Cash Flow:</strong> {business?.cashFlow ? `$${business.cashFlow.toLocaleString()}` : "-"}
                </div>
                <div className="busines_lisiting_highLevelSummary_list">
                  <strong>Revenue:</strong> {business?.revenue ? `$${business.revenue.toLocaleString()}` : "-"}
                </div>
                <div className="busines_lisiting_highLevelSummary_list">
                  <strong>Rent:</strong> {business?.monthlyRentAmount ? `$${business.monthlyRentAmount.toLocaleString()}` : "-"}
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
                   <div
                        className="business__list_single_description_content"
                        dangerouslySetInnerHTML={{
                          __html: business.listingDescription,
                        }}
                      />
                    <div className="about_listing_toggle">
                      <div className="about_listing_toggle_item"><strong>Franchise:</strong> {business?.isFranchise? business?.isFranchise : "-" }</div>
                      <div className="about_listing_toggle_item"><strong>Relocate:</strong>{business?.isRelocatable? business?.isRelocatable : "-"}</div>
                      <div className="about_listing_toggle_item"><strong>Startup:</strong>{business?.isStartup? business?.isStartup : "-"}</div>
                    </div>
                  </div>
       
       
                  <div className="business__list_single_description_row">
          <h3>Additional Financial Details</h3>
          <div className="about_listing_toggle">
              <div className="about_listing_toggle_item">
                <strong>Real Estate:</strong> {renderMoney(business?.propertyValue)}
              </div>

              <div className="about_listing_toggle_item">
                <strong>Real Estate Included:</strong> {renderYesNo(business?.propertyIncludedinAskingPrice)}
              </div>

              <div className="about_listing_toggle_item">
                <strong>FFE Value:</strong> {renderMoney(business?.ffEValue)}
              </div>

              <div className="about_listing_toggle_item">
                <strong>FFE Include:</strong> {renderYesNo(business?.ffEValueIncludeinAskingPrice)}
              </div>

              <div className="about_listing_toggle_item">
                <strong>Inventory Value:</strong> {renderMoney(business?.inventoryValue)}
              </div>

              <div className="about_listing_toggle_item">
                <strong>Inventory Included:</strong> {renderYesNo(business?.inventoryIncluded)}
              </div>
            </div>
 
        </div>

       
       
               <div className="business__list_single_key_highlights_Business_overview">
                 <div className="business__list_single_business_overview">
                   <h3 className="m-b-10">Detailed Information</h3>
                  <div className="business_list_single_overview_list">
                    <strong>Reason for Selling :</strong>{" "}
                    {business?.reasonForSelling ? (
                      <span
                        dangerouslySetInnerHTML={{
                          __html: business.reasonForSelling,
                        }}
                      />
                    ) : (
                      "-"
                    )}
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
                     <strong>Lease Expiration:</strong>{business?.leaseExpiration ? (<>{new Date(business?.leaseExpiration).toLocaleDateString()}</>) : "-" } 
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


{business?.showContactOnListing && (<>

              <div className="business__list_single_key_highlights_Business_overview_owner_details">
              <div className="business__list_single_business_overview">
                <h3 className="m-b-10">Owner Contact Details</h3>
                {business?.ownerId?.profile?.brokerProfileImage && (

                  <>
                  <div className="business_list_single_overview_list"><img src={business?.ownerId?.profile?.brokerProfileImage? business?.ownerId?.profile?.brokerProfileImage : ""} alt="Broker Profile Image" className="broker_profile_image" /></div>
                  <br />
                  </>
                )}
                    
                      <div className="business_list_single_overview_list"><strong>Name:</strong> {business?.ownerId?.first_name || "-"} {business?.ownerId?.last_name || "-"}</div>
                      <div className="business_list_single_overview_list"><strong>Email:</strong> {business?.ownerId?.email || "-"}</div>
                        <div className="business_list_single_overview_list"><strong>Phone:</strong> {business?.ownerId?.profile?.phone_number || "-"}</div>
                      <div className="business_list_single_overview_list"><strong>Company:</strong> {business?.ownerId?.profile?.company || "-"}</div>

                    {business?.ownerId?.profile?.logo && (

                      <>
                      <div className="business_list_single_overview_list"><strong>Logo:</strong>  <img src={business?.ownerId?.profile?.logo? business?.ownerId?.profile?.logo : ""} alt="Broker Profile Image" className="broker_logo_image" /></div>
                      <br />
                      </>

                    )}
                      

                      {/* <div className="business_list_single_overview_list">
                        {business?.ownerId?.profile?.website ? (
                          <a href={business?.ownerId?.profile?.website} target="_blank" rel="noopener noreferrer">
                            {business?.ownerId?.profile?.website}
                          </a>
                        ) : "-"}
                      </div> */}
                      <div className="business_list_single_overview_list overview__about_user_wrap">
                            <strong>Overview:</strong>{" "}
                            <span className="overview__about_user"
                              dangerouslySetInnerHTML={{
                                __html: business?.ownerId?.profile?.overview || "-",
                              }}
                            />
                          </div>

                    </div>
              
            </div>
</>)}




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
<Dialog
  header="Contact Seller"
  visible={showContactModal}
  style={{ width: "450px", maxWidth: "95vw" }}
  modal
  onHide={() => setShowContactModal(false)}
>
   <form onSubmit={handleContactSeller} className="p-fluid contact__form_listin_seller">


<div className="field">
      <label>Full Name *</label>
    
      <InputText

          value={contactForm.fullName}
         onChange={(e) =>
          setContactForm({ ...contactForm, fullName: e.target.value })
        }
        
      required
      />
    </div>

<div className="field">
      <label>Phone Number *</label>
      <InputMask
            mask="(999) 999-9999"
             value={contactForm.phone}
            onChange={(e) =>
              setContactForm({ ...contactForm, phone: e.target.value })
            }
            required
          />
</div>
    <div className="field">
      <label>Email Address *</label>
      <InputText
          value={contactForm.senderEmail}
        onChange={(e) =>
          setContactForm({ ...contactForm, senderEmail: e.target.value })
        }
      required
      />

    </div>




{business?.ownerId?.user_type === "seller_broker" && <>

    <div className="field">
      <label>Zip Code</label>
    
      <InputText

          value={contactForm.zipCode}
         onChange={(e) =>
          setContactForm({ ...contactForm, zipCode: e.target.value })
        }
        
      
      />
    </div>

     <div className="field">
      <label>Amount To invest</label>
    
      <InputText

          value={contactForm.amountToInvest}
         onChange={(e) =>
          setContactForm({ ...contactForm, amountToInvest: e.target.value })
        }
        
      
      />
    </div>

</>}





    <div className="field">
      <label>Optional Message</label>
      <InputTextarea
        rows={5}
        value={contactForm.details}
        onChange={(e) =>
          setContactForm({ ...contactForm, details: e.target.value })
        }
      />
    </div>

    <Button
      type="submit"
      label={sending ? "Sending..." : "Send Message"}
      disabled={sending}
      className="btn__crt_listing"
    />
  </form>
</Dialog>

    </>
  );
}
