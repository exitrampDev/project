import React, { useEffect, useState, useRef } from "react";
import { Card } from "primereact/card";
import { useRecoilValue } from "recoil";
import { authState,apiBaseUrlState  } from "../../../recoil/ctaState";
import axios from "axios";
import { Toast } from 'primereact/toast';
import { ConfirmPopup, confirmPopup } from "primereact/confirmpopup";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Tag } from "primereact/tag";
import { Dialog } from "primereact/dialog";
import notifInfo from "../../../assets/notifInfo.png";
import serachIcon from "../../../assets/serachIcon.png";
import userImg from "../../../assets/userImg.png";
import { MultiSelect } from "primereact/multiselect";
import { FileUpload } from "primereact/fileupload";
import { Tooltip } from "primereact/tooltip";
import { RadioButton } from "primereact/radiobutton";
import { InputTextarea } from "primereact/inputtextarea";
import { InputNumber } from "primereact/inputnumber";
import { Checkbox } from "primereact/checkbox";
import { Chips } from "primereact/chips";
import { Link } from "react-router-dom";
import { InputSwitch } from "primereact/inputswitch";

export default function SellerListing() {
  const toast = useRef(null);
  const yearOptions = Array.from({ length: 101 }, (_, i) => ({ label: i, value: i }));
  const API_BASE = useRecoilValue(apiBaseUrlState);
const [filteredListings, setFilteredListings] = useState([]);
const locationOptions = [
  { label: "Headquarters", value: "Headquarters" },
  { label: "Office", value: "Office" },
  { label: "Retail", value: "Retail" },
  { label: "Warehouse", value: "Warehouse" },
  { label: "Storage", value: "Storage" },
];

const ownershipOptions = [
  { label: "Owned", value: "Owned" },
  { label: "Leased", value: "Leased" },
];

const includedOptions = [
  { label: "Real Estate Included", value: "Real Estate Included" },
  { label: "Real Estate Excluded", value: "Real Estate Excluded" },
  { label: "TBD", value: "TBD" },
];

const assetTypeOptions = [
  { label: "Fixed Assets", value: "Fixed Assets" },
  { label: "Intangible Assets", value: "Intangible Assets" },
];

const assetsIncludedOptions = [
  { label: "Included", value: "Included" },
  { label: "Excluded", value: "Excluded" },
];
    const [files, setFiles] = useState({
    profit_loss: null,
    balance_sheet: null,
    three_year_tax_return: null,
    ownership_or_cap_table: null,
  });
  const [listingStep, setListingStep] = useState(0);
   const [fileListingUploadId, setFileListingUploadId] = useState(0);
  const { user, access_token } = useRecoilValue(authState) ?? {};
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const entityTypes = [
    { label: "LLC", value: "LLC" },
    { label: "C-Corp", value: "C-Corp" },
    { label: "S-Corp", value: "S-Corp" },
    { label: "LLP", value: "LLP" },
    { label: "Sole Proprietorship", value: "Sole Proprietorship" },
    { label: "PLLC", value: "PLLC" },
    { label: "LP", value: "LP" },
    { label: "Other", value: "Other" },
  ];
  const industryOptions = [
  { label: "Administrative and Support", value: "Administrative and Support" },
  { label: "Agriculture, Farming, Forestry", value: "Agriculture, Farming, Forestry" },
  { label: "Entertainment and Recreation", value: "Entertainment and Recreation" },
  { label: "Arts and Entertainment", value: "Arts and Entertainment" },
  { label: "Automotive, RV, Boat", value: "Automotive, RV, Boat" },
  { label: "Beauty and Personal Care", value: "Beauty and Personal Care" },
  { label: "Building Material and Supplies", value: "Building Material and Supplies" },
  { label: "Computer and Electronic", value: "Computer and Electronic" },
  { label: "Construction", value: "Construction" },
  { label: "Consulting", value: "Consulting" },
  { label: "Contracting Services", value: "Contracting Services" },
  { label: "Delivery Services", value: "Delivery Services" },
  { label: "Education and Children", value: "Education and Children" },
  { label: "Electrical and Appliance", value: "Electrical and Appliance" },
  { label: "Financial Services", value: "Financial Services" },
  { label: "Fitness", value: "Fitness" },
  { label: "Food Services and Restaurants", value: "Food Services and Restaurants" },
  { label: "Gas Stations", value: "Gas Stations" },
  { label: "Health Care", value: "Health Care" },
  { label: "Hotel and Accommodations", value: "Hotel and Accommodations" },
  { label: "Waste Management", value: "Waste Management" },
  { label: "Wholesale and Distribution", value: "Wholesale and Distribution" },
  { label: "Daycare", value: "Daycare" },
  { label: "Information Technology", value: "Information Technology" },
  { label: "Insurance", value: "Insurance" },
  { label: "Manufacturing", value: "Manufacturing" },
  { label: "Mining and Quarrying", value: "Mining and Quarrying" },
  { label: "Oil and Gas", value: "Oil and Gas" },
  { label: "Other Non-Categorized", value: "Other Non-Categorized" },
  { label: "Personal Care", value: "Personal Care" },
  { label: "Pet Services", value: "Pet Services" },
  { label: "Printing", value: "Printing" },
  { label: "Real Estate", value: "Real Estate" },
  { label: "Religious", value: "Religious" },
  { label: "Retail", value: "Retail" },
  { label: "Home Services", value: "Home Services" },
  { label: "Storage", value: "Storage" },
  { label: "Telecommunication", value: "Telecommunication" },
  { label: "Transportation", value: "Transportation" },
  { label: "Travel", value: "Travel" },
  { label: "Advertising and Marketing", value: "Advertising and Marketing" },
  { label: "Sanitation and Cleaning", value: "Sanitation and Cleaning" },
];
  const [filters, setFilters] = useState({
    search: "",
    industry: null,
    status: null,
    year: null,
    location: null,
    lastEdited: null,
  });

  // Create Listing Dialog
  const [showCreateDialog, setShowCreateDialog] = useState(false);
     const [newListing, setNewListing] = useState({
     listingTitle: "",
askingPrice: 0,
image: "",
listingDescription: "",
industry: [],
yourRole: "",
contactAddress: "",
contactName: "",
contactPhone: "",
contactEmail: "",
contactZipCode: "",
 businessName: "",
businessCity: "",
businessState: "",
businessCountry: "",
businessZipCode: "",
yearStablished: 1900,
reasonForSelling: "",
isFranchise: false,
isRelocatable: false,
isStartup: false,
postCloseSupport: "",
managementWillingToStay: "",
numberOfEmployees: 0,
financing: 0,
growthExpansion: [],
facilityAndLocationDetails: "",
propertyIncludedinAskingPrice: false,
realEstateValue: 0,
leaseExpiration:"",
buildingSF: "", 
ffEValue: 0,
ffEValueIncludeinAskingPrice: false,
inventoryValue: 0,
inventoryIncludedinAskingPrice: false,
annualRevenue: {
      reportingYear: "",
      revenue: ""
    },
latestEBITDA:"",
latestSDE: "",
cashFlow: "",
latestNetProfit: "",
listingReferenceNumber: Math.random().toString(16).substring(2, 10),
  });


const documentRoomLink = (id) => {
  return(
    <>
 {user?.user_type === "seller_central" && <>
      <Link to={`/user/document-room/${id}`} className="">View Doc Room</Link>
    </>}
     {user?.user_type === "seller_listing" && <>
      <span className="data__locked">
        <i className="pi pi-lock"></i> Upgarade to unlock
      </span>
    </>}
    
    </>
  )
}

const createCIMList = (id, cimUrl) => {
  return(
    <>
 {user?.user_type === "seller_central" && <>
 {cimUrl ? (<><Link to={`/user/create-cim/${id}`} className="">View CIM</Link></>) : (<><Link to={`/user/create-cim/${id}`} className="">Create CIM</Link></>)}
      
    </>}
     {user?.user_type === "seller_listing" && <>
      <span className="data__locked">
        <i className="pi pi-lock"></i> Upgarade to unlock
      </span>
    </>}
    
    </>
  )
}





  // Fetch Listings
  const fetchListings = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/business-listing`, {
        headers: { Authorization: `Bearer ${access_token}` },
        Authorization: `Bearer ${access_token}`,
      });
      if (Array.isArray(res.data)) {
        setListings(res.data);
      } else if (Array.isArray(res.data.data)) {
        setListings(res.data.data);
      } else {
        setListings([]);
      }
    } catch (err) {
      console.error("Error fetching listings:", err);
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (access_token) fetchListings();
  }, [access_token]);

// Create Listing Handler
const handleCreateListing = async () => {
  try {
    let payload = {
      ...newListing,
          revenue: JSON.stringify(newListing.revenue),
          askingPrice: JSON.stringify(newListing.askingPrice),
          cashFlow: JSON.stringify(newListing.cashFlow),
          annualRevenue: JSON.stringify(newListing.annualRevenue),
          affiliateCompanies: JSON.stringify(newListing.affiliateCompanies),
          businessDetails: JSON.stringify(newListing.businessDetails),
          competitors: JSON.stringify(newListing.competitors),
          customersAndConcentration: JSON.stringify(newListing.customersAndConcentration),
          ffeAssets: JSON.stringify(newListing.ffeAssets),
          industry: JSON.stringify(newListing.industry),
          keyHighlights: JSON.stringify(newListing.keyHighlights),
          keySuppliers: JSON.stringify(newListing.keySuppliers),
          marketingAndSalesTactics: JSON.stringify(newListing.marketingAndSalesTactics),
          productRevenueMix: JSON.stringify(newListing.productRevenueMix),
          propertiesIncluded: JSON.stringify(newListing.propertiesIncluded),
          growthExpansion: JSON.stringify(newListing.growthExpansion), 
          // businessName: newListing.businessName),
          growthOpportunities: JSON.stringify(newListing.growthOpportunities),
          growthOpportunityNarrative: JSON.stringify(newListing.growthOpportunityNarrative),
    };

    // Capture response here
    const response = await axios.post(
      `${API_BASE}/business-listing`,
      payload,
      {
        headers: { Authorization: `Bearer ${access_token}` },
      }
    );
    // If you only want the response data:
    setFileListingUploadId(response.data._id);

    // reset form
    setNewListing({
    listingTitle: "",
askingPrice: 0,
image: "",
listingDescription: "",
industry: [],
yourRole: "",
contactAddress: "",
contactName: "",
contactPhone: "",
contactEmail: "",
contactZipCode: "",
 businessName: "",
businessCity: "",
businessState: "",
businessCountry: "",
businessZipCode:"",
yearStablished: 1900,
reasonForSelling: "",
isFranchise: false,
isRelocatable: false,
isStartup: false,
postCloseSupport: "",
managementWillingToStay: "",
numberOfEmployees: 0,
financing: 0,
growthExpansion: [],
facilityAndLocationDetails: "",
propertyIncludedinAskingPrice: false,
realEstateValue: 0,
leaseExpiration:"",
buildingSF: "", 
ffEValue: 0,
ffEValueIncludeinAskingPrice: false,
inventoryValue: 0,
inventoryIncludedinAskingPrice: false,
annualRevenue: {
      reportingYear: "",
      revenue: ""
    },
latestEBITDA:"",
latestSDE: "",
cashFlow: "",
latestNetProfit: "",
listingReferenceNumber: Math.random().toString(16).substring(2, 10),
    });

    fetchListings(); // refresh table
    setListingStep(listingStep + 1);

     toast.current.show({
      severity: "success",
      detail: "Listing Form Submit Now Upload Files",
      life: 4000,
    });
  } catch (error) {
   // console.error("Error creating listing:", error.response?.data || error.message);

     toast.current.show({
      severity: "error",
      detail: error.message,
      life: 4000,
    });
  }
};


const handleFileUpload = async (file, type) => {
  const objectURL = URL.createObjectURL(file);
  setFiles((prev) => ({ 
    ...prev, 
    [type]: { file, objectURL } 
  }));
};

const handleSubmit = async () => {
  const uploadUrl = `${API_BASE}/files/${fileListingUploadId}/upload`;
  const businessId = `${fileListingUploadId}`;

  try {
    for (const [key, fileObj] of Object.entries(files)) {
      if (!fileObj?.objectURL) continue;

      // Fetch blob from object URL
      const response = await fetch(fileObj.objectURL);
      const blob = await response.blob();
      const typeName = blob.type ? blob.type.split("/")[1] : "unknown";

      const formData = new FormData();
      formData.append("file", blob, `${key}.${typeName}`);
      formData.append("displayName", key);
      formData.append("typeName", typeName);
      formData.append("businessId", businessId);

      await axios.post(uploadUrl, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${access_token}`,
        },
      });
    }

    // Optional: navigate after upload
    window.location.href = `/user/single-listing/${fileListingUploadId}`;
  } catch (error) {
    toast.current.show({
      severity: "error",
      detail: error.message,
      life: 4000,
    });
  }
};


  // ==== Templates ====
  const listingNameTemplate = (row) => (
    <div className="flex align-items-center">
      <img
        src={row.image || "https://via.placeholder.com/40"}
        alt={row.businessName}
        style={{ width: "40px", borderRadius: "6px", marginRight: "10px" }}
      />
      <span>{row.businessName?.replace(/^"|"$/g, '')}</span>
    </div>
  );

  const industryTemplate = (row) => {
  try {
    const industries = JSON.parse(row.industry); // parse the string
    if (Array.isArray(industries) && industries.length) {
      return industries.join(" | ");
    }
  } catch (e) {
    console.error("Invalid industry format:", row.industry);
  }
  return "-"; // fallback
};


  const statusTemplate = (row) => (
    <Tag
      value={row.status}
      severity={
        row.status === "live"
          ? "success"
          : row.status === "inactive"
          ? "danger"
          : "primary"
      }
    />
  );

  const cimTemplate = (row) => {
  const formattedStatus = row.cimStatus
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
   <>
   {user?.user_type === "seller_central" && <>
    <Tag
      value={formattedStatus}
      severity={
        row.cimStatus === "ready_to_share"
          ? "success"
          : row.cimStatus === "incomplete"
          ? "warning"
          : "danger"
      }
    />
    </>}
     {user?.user_type === "seller_listing" && <>
      <span className="data__locked">
        <i className="pi pi-lock"></i> Locked
      </span>
    </>}
   </>
  );
};


  const locationTemplate = (row) =>
    row.businessCity && row.businessState ? `${row.businessCity}, ${row.businessState}` : "-";

const moneyTemplate = (row, { field }) => {
  const value = row[field];
  return value !== null && value !== undefined
    ? `${value.toLocaleString()}`
    : "-";
};


  const dateTemplate = (row) =>
    row.lastEdited
      ? new Date(row.lastEdited).toLocaleDateString()
      : "Not Edited";

  const handleDeleteListing = async (event,id) => {
    confirmPopup({
    target: event.currentTarget,
    message: "Are you sure you want to delete this listing?",
    icon: "pi pi-exclamation-triangle",
    className: "confirm__dlt_listing",
    acceptLabel: "Yes",
    rejectLabel: "No",
    accept: async () => {
      try {
        await axios.delete(`${API_BASE}/business-listing/${id}`, {
          headers: { Authorization: `Bearer ${access_token}` },
        });
        fetchListings(); // refresh table
      } catch (error) {
        console.error("Error deleting listing:", error);
      }
    },
  });
  };
 const handleChange = (e, field) => {
    setNewListing({ ...newListing, [field]: e.target.value });
  };
  const actionTemplate = (row) => (
    <div className="action__listing_btns">
      <Link to={`/user/single-listing/${row._id}`} className="flex gap-4">
      <i
        className="pi pi-eye cursor-pointer text-blue-500 hover:text-blue-700"
        onClick={() => console.log("View", row._id)}
      ></i>
      </Link>
      

      {row.status === "published" ? (<>
       <i
          className="pi pi-times cursor-pointer text-red-500 hover:text-red-700 button__unpublish_action_lisitng_seller"
          onClick={() => console.log("Unpublish", row._id)}
          data-pr-tooltip="Unpublish"
        ></i>
        <Tooltip target=".button__unpublish_action_lisitng_seller" position="top" />
      
      </>
       
      ) : (
        <i
          className="pi pi-pencil cursor-pointer text-green-500 hover:text-green-700"
          onClick={() => console.log("Publish", row._id)}
        ></i>
      )}

      <i
        className="pi pi-trash cursor-pointer text-red-500 hover:text-red-700 button__delete_action_lisitng_seller"
        onClick={(e) => handleDeleteListing(e,row._id)}
         data-pr-tooltip="Remove"
        ></i>
        
        <Tooltip target=".button__delete_action_lisitng_seller" position="top" />
    </div>
  );
const handleImageSelect = (e) => {
  const file = e.files[0];
  const reader = new FileReader();

  reader.onloadend = () => {
    setNewListing({ ...newListing, image: reader.result }); 
  };

  reader.readAsDataURL(file);
};
useEffect(() => {
  let filtered = [...listings];

  // Search filter (check in name, location, or other text fields)
  if (filters.search) {
    const searchTerm = filters.search.toLowerCase();
    filtered = filtered.filter(
      (item) =>
        item.listingName?.toLowerCase().includes(searchTerm) ||
        item.location?.toLowerCase().includes(searchTerm)
    );
  }

  // Industry filter
  if (filters.industry) {
    filtered = filtered.filter((item) => item.industry === filters.industry);
  }

  // Status filter
  if (filters.status) {
    filtered = filtered.filter((item) => item.status === filters.status);
  }

  // Year filter
  if (filters.year) {
    filtered = filtered.filter(
      (item) => item.yearStablished?.toString() === filters.year.toString()
    );
  }

  // Location filter
  if (filters.location) {
    const locationTerm = filters.location.toLowerCase();
    filtered = filtered.filter((item) =>
      item.location?.toLowerCase().includes(locationTerm)
    );
  }

  // Last Edited filter (assuming item.lastEdited is a Date or ISO string)
  if (filters.lastEdited) {
    const selectedDate = new Date(filters.lastEdited).toDateString();
    filtered = filtered.filter(
      (item) => new Date(item.lastEdited).toDateString() === selectedDate
    );
  }

  setFilteredListings(filtered);
}, [filters, listings]);

  // ==== UI ====
  return (
    <>
    <Toast ref={toast} />
      <div className="my-listings-page">
        <ConfirmPopup />
        {showCreateDialog ? (
          <>
             {listingStep === 0 && (<>
            <div className="dashboard__header_block">
              <h3 className="heading__Digital_CIM">
                {" "}
                Create Your Business Listing
              </h3>

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

            <div className="brief__infor_content">
              <p>
                This information is used to generate your business listing and prepare your business for buyer review.
              </p>
            </div>
            <div className="">
            <div className="listing__creation_block_main_wrap">

 {/* Listing Title */}
      <div className="listing__creation_field_col md:col-4">
        <label>Listing Title </label>
          <InputText
            value={newListing.listingTitle || ""}
            onChange={(e) => handleChange(e, "listingTitle", e.target.value)}
            placeholder="Enter Listing Title"
          />
      </div>
{/* Asking Price */}
      <div className="listing__creation_field_col md:col-4">
        <label>Asking Price </label>
        <InputNumber
          value={newListing.askingPrice}
          onValueChange={(e) => setNewListing({ ...newListing, askingPrice: e.value })}
          mode="currency"
          currency="USD"
        />
      </div>


{/* File Uploads */}
      <div className="listing__creation_field_col file_business_logo md:col-6">
        <label>Main Listing Image <span className="required__star">*</span></label>
        <FileUpload
          accept="image/*"
          maxFileSize={1000000}
          customUpload
          auto
          chooseLabel="Upload Image (Max 500KB)"
           uploadHandler={(e) => {
            handleImageSelect(e);
            e.options.clear(); 
          }}
        />
      </div>
{/* Listing Description */}
      <div className="listing__creation_field_col md:col-6">
        <label>Listing Description </label>
         <InputTextarea
            value={newListing.listingDescription || ""}
            onChange={(e) =>
              setNewListing({ ...newListing, listingDescription: e.target.value })
            }
            placeholder="Enter Listing Description"
            rows={3}
            cols={30}
          />
      </div>

 {/* Industry */}
      <div className="listing__creation_field_col md:col-6">
        <label>Industry </label>
        <MultiSelect
        value={newListing.industry}
        options={industryOptions}
        onChange={(e) =>
          setNewListing({ ...newListing, industry: e.value })
        }
        placeholder="Select Industries"
        display="chip"
        filter
        required
        className="w-full"
      />
      </div>
 {/* Your Role */}
      <div className="listing__creation_field_col md:col-6">
        <label>Your Role </label>
        <Dropdown
          value={newListing.yourRole}
          options={[{ label: "Legal Owner", value: "Legal Owner" }, { label: "Broker", value: "Broker" }, { label: "Other Third Party", value: "Other Third Party" }]}
          onChange={(e) => handleChange(e, "yourRole")}
          placeholder="Select"
        />
      </div>



{/* Contact Address */}
<div className="listing__creation_field_col md:col-6">
  <label>Contact Address </label>
  <InputText
    value={newListing.contactAddress || ""}
    onChange={(e) =>
      setNewListing({ ...newListing, contactAddress: e.target.value })
    }
    placeholder="Enter Contact Address"
  />
</div>


{/* Contact Name */}
<div className="listing__creation_field_col md:col-6">
  <label>Contact Name </label>
  <InputText
    value={newListing.contactName || ""}
    onChange={(e) =>
      setNewListing({ ...newListing, contactName: e.target.value })
    }
    placeholder="Enter Contact Name"
  />
</div>

{/* Contact Phone */}
<div className="listing__creation_field_col md:col-6">
  <label>Contact Phone </label>
  <InputText
    value={newListing.contactPhone || ""}
    onChange={(e) =>
      setNewListing({ ...newListing, contactPhone: e.target.value })
    }
    placeholder="Enter Contact Phone"
  />
</div>

{/* Contact Email */}
<div className="listing__creation_field_col md:col-6">
  <label>Contact Email </label>
  <InputText
    type="email"
    value={newListing.contactEmail || ""}
    onChange={(e) =>
      setNewListing({ ...newListing, contactEmail: e.target.value })
    }
    placeholder="Enter Contact Email"
  />
</div>

{/* Contact Zip Code */}
<div className="listing__creation_field_col md:col-6">
  <label>Contact Zip Code </label>
  <InputText
    value={newListing.contactZipCode || ""}
    onChange={(e) =>
      setNewListing({ ...newListing, contactZipCode: e.target.value })
    }
    placeholder="Enter Zip Code"
  />
</div>
{/* Business Name */}
      <div className="listing__creation_field_col md:col-4">
        <label>Business Name <span className="required__star">*</span></label>
        <InputText
          value={newListing.businessName}
          onChange={(e) => handleChange(e, "businessName")}
        />
      </div>
 {/* Business City */}
<div className="listing__creation_field_col md:col-4">
  <label>Business City </label>
  <InputText
    value={newListing.businessCity || ""}
    onChange={(e) => handleChange(e, "businessCity", e.target.value)}
    placeholder="Enter Business City"
  />
</div>


{/* State */}
<div className="listing__creation_field_col md:col-4">
  <label> Business State </label>
  <InputText
    value={newListing.businessState || ""}
    onChange={(e) => handleChange(e, "businessState", e.target.value)}
    placeholder="Enter Business State"
  />
</div>

{/* Country */}
<div className="listing__creation_field_col md:col-4">
  <label> Business Country </label>
  <InputText
    value={newListing.businessCountry || ""}
    onChange={(e) => handleChange(e, "businessCountry", e.target.value)}
    placeholder="Enter Business Country"
  />
</div> 

{/* Business Zip Code */}
<div className="listing__creation_field_col md:col-4">
  <label> Business Zip Code </label>
  <InputText
    value={newListing.businessZipCode || ""}
    onChange={(e) => handleChange(e, "businessZipCode", e.target.value)}
    placeholder="Enter Business Zip Code"
  />
</div>  
 {/* Founding Year */}
 <div className="listing__creation_field_col md:col-4">
  <label> Founding Year </label>
  <Calendar
    value={newListing.yearStablished ? new Date(newListing.yearStablished) : null}
    onChange={(e) =>
      handleChange(e, "yearStablished", e.value ? e.value.getFullYear() : "")
    }
    view="year"
    dateFormat="yy"   // shows only year
    placeholder="Select Year"
    
  />
</div>
 {/* Reason For Selling */}
      <div className="listing__creation_field_col md:col-6">
        <label>Reason For Selling </label>
        <InputTextarea
          rows={3}
          value={newListing.reasonForSelling}
          onChange={(e) => handleChange(e, "reasonForSelling")}
        />
      </div>



{/* Is Franchise */}
<div className="listing__creation_field_col md:col-4">
  <label>Is Franchise </label>
  <InputSwitch
    checked={newListing.isFranchise}
    onChange={(e) =>
      setNewListing({ ...newListing, isFranchise: e.value })
    }
  />
</div>

{/* Is Relocatable */}
<div className="listing__creation_field_col md:col-4">
  <label>Is Relocatable </label>
  <InputSwitch
    checked={newListing.isRelocatable}
    onChange={(e) =>
      setNewListing({ ...newListing, isRelocatable: e.value })
    }
  />
</div>

{/* Is Startup */}
<div className="listing__creation_field_col md:col-4">
  <label>Is Startup </label>
  <InputSwitch
    checked={newListing.isStartup}
    onChange={(e) =>
      setNewListing({ ...newListing, isStartup: e.value })
    }
  />
</div>
{/* Post Close Support */}
      <div className="listing__creation_field_col md:col-4">
        <label>Post Close Support </label>
        <Dropdown
          value={newListing.postCloseSupport}
          options={[
              { label: "Yes, for an agreed period", value: "Yes" },
              { label: "No, not available", value: "No" },
              { label: "To be determined", value: "to_Be_Determined" }
            ]}
          onChange={(e) => handleChange(e, "postCloseSupport")}
          placeholder="Select"
        />
      </div>


  {/* Management Willing to Stay */}
      <div className="listing__creation_field_col md:col-4">
        <label>Management Willing to Stay </label>
        <div className="flex align-items-center gap-3 mt-2">
          <RadioButton
            inputId="yes"
            name="managementWillingToStay"
            value="yes"
            onChange={(e) =>
              setNewListing({ ...newListing, managementWillingToStay: e.value })
            }
            checked={newListing.managementWillingToStay === "yes"}
          />
          <label htmlFor="yes">Yes </label>
          <RadioButton
            inputId="no"
            name="managementWillingToStay"
            value="no"
            onChange={(e) =>
              setNewListing({ ...newListing, managementWillingToStay: e.value })
            }
            checked={newListing.managementWillingToStay === "no"}
          />
          <label htmlFor="no">No </label>
        </div>
      </div>


  {/* Number of Employees */}
      <div className="listing__creation_field_col md:col-4">
        <label>Number of Employees </label>
        <Dropdown
          value={newListing.numberOfEmployees}
          options={[{ label: "10-50", value: "10-50" }, { label: "50-100", value: "50-100" }]}
          onChange={(e) => handleChange(e, "numberOfEmployees")}
          placeholder="Select"
        />
      </div>

      {/* Financiing */}
        <div className="listing__creation_field_col md:col-6">
          <label>Financiing </label>
          <InputNumber
            value={newListing.financing || 0}
            onValueChange={(e) =>
              setNewListing({ ...newListing, financing: e.value })
            }
            mode="currency"
            currency="USD"
            locale="en-US"
            className="w-full"
            placeholder="Enter financiing value"
          />
        </div>

{/* Growth Expansion */}
<div className="listing__creation_field_col md:col-12">
  <label>Growth and Expansion (up to 6) </label>
  <InputTextarea
  value={newListing.growthExpansion?.join("\n") || ""}
  onChange={(e) =>
    setNewListing({
      ...newListing,
      growthExpansion: e.target.value
        .split("\n")
        .slice(0, 6),
    })
  }

  rows={6}
  cols={30}
/>

</div>

{/* Facility and Location Summary */}
<div className="listing__creation_field_col md:col-6">
  <label>Facility and Location Summary </label>
  <InputTextarea
  name="facilityAndLocationDetails"
  value={newListing.facilityAndLocationDetails}
  onChange={(e) => handleChange(e, "facilityAndLocationDetails")}
/>
</div>

{/* Property Includedin Asking Price */}
<div className="listing__creation_field_col md:col-4">
  <label>Property Includedin Asking Price </label>
  <div className="flex align-items-center gap-3 mt-2">
    <RadioButton
      inputId="confidential"
      name="propertyIncludedinAskingPrice"
      value="true"
      onChange={(e) =>
        setNewListing({ ...newListing, propertyIncludedinAskingPrice: e.value })
      }
      checked={newListing.propertyIncludedinAskingPrice === "true"}
    />
    <label htmlFor="confidential">Yes </label>

    <RadioButton
      inputId="nonConfidential"
      name="propertyIncludedinAskingPrice"
      value="false"
      onChange={(e) =>
        setNewListing({ ...newListing, propertyIncludedinAskingPrice: e.value })
      }
      checked={newListing.propertyIncludedinAskingPrice === "false"}
    />
    <label htmlFor="nonConfidential">No </label>
  </div>
</div>

{/* Real Estate Value */}
<div className="listing__creation_field_col md:col-6">
  <label>Real Estate Value </label>
  <InputNumber
    value={newListing.realEstateValue || 0}
    onValueChange={(e) =>
      setNewListing({ ...newListing, realEstateValue: e.value })
    }
    mode="currency"
    currency="USD"
    locale="en-US"
    className="w-full"
    placeholder="Enter real estate value"
  />
</div>

  {/* Lease Expiration */}
      <div className="listing__creation_field_col md:col-4">
        <label> Lease Expiration</label>
        <InputText
          value={newListing.leaseExpiration}
          onChange={(e) => handleChange(e, "leaseExpiration")}
        />
      </div>

 {/* Building SF */}
      <div className="listing__creation_field_col md:col-4">
        <label> Building SF</label>
        <InputText
          value={newListing.buildingSF}
          onChange={(e) => handleChange(e, "buildingSF")}
        />
      </div>

{/* FFE Value */}
<div className="listing__creation_field_col md:col-6">
  <label>FFE Value </label>
  <InputNumber
    value={newListing.ffEValue || 0}
    onValueChange={(e) =>
      setNewListing({ ...newListing, ffEValue: e.value })
    }
    mode="currency"
    currency="USD"
    locale="en-US"
    className="w-full"
    placeholder="Enter FFE value"
  />
</div>



{/* ffEValueIncludeinAskingPrice */}
<div className="listing__creation_field_col md:col-4">
  <label>FFE Value Include in Asking Price </label>
  <div className="flex align-items-center gap-3 mt-2">
    <RadioButton
      inputId="confidential"
      name="ffEValueIncludeinAskingPrice"
      value="true"
      onChange={(e) =>
        setNewListing({ ...newListing, ffEValueIncludeinAskingPrice: e.value })
      }
      checked={newListing.ffEValueIncludeinAskingPrice === "true"}
    />
    <label htmlFor="confidential">Yes </label>

    <RadioButton
      inputId="nonConfidential"
      name="ffEValueIncludeinAskingPrice"
      value="false"
      onChange={(e) =>
        setNewListing({ ...newListing, ffEValueIncludeinAskingPrice: e.value })
      }
      checked={newListing.ffEValueIncludeinAskingPrice === "false"}
    />
    <label htmlFor="nonConfidential">No </label>
  </div>
</div>


{/* Inventory Value */}
<div className="listing__creation_field_col md:col-6">
  <label>Inventory Value </label>
  <InputNumber
    value={newListing.inventoryValue || 0}
    onValueChange={(e) =>
      setNewListing({ ...newListing, inventoryValue: e.value })
    }
    mode="currency"
    currency="USD"
    locale="en-US"
    className="w-full"
    placeholder="Enter inventory value"
  />
</div>





{/* inventoryIncludedinAskingPrice */}
<div className="listing__creation_field_col md:col-4">
  <label>Inventory Included in Asking Price</label>
  <div className="flex align-items-center gap-3 mt-2">
    <RadioButton
      inputId="confidential"
      name="inventoryIncludedinAskingPrice"
      value="true"
      onChange={(e) =>
        setNewListing({ ...newListing, inventoryIncludedinAskingPrice: e.value })
      }
      checked={newListing.inventoryIncludedinAskingPrice === "true"}
    />
    <label htmlFor="confidential">Yes </label>

    <RadioButton
      inputId="nonConfidential"
      name="inventoryIncludedinAskingPrice"
      value="false"
      onChange={(e) =>
        setNewListing({ ...newListing, inventoryIncludedinAskingPrice: e.value })
      }
      checked={newListing.inventoryIncludedinAskingPrice === "false"}
    />
    <label htmlFor="nonConfidential">No </label>
  </div>
</div>

    
{/* Latest Reporting Year */}
<div className="listing__creation_field_col md:col-6">
  <label>Latest Reporting Year </label>
  <InputText
  type="number"
  value={newListing.annualRevenue?.reportingYear || ""}
  onChange={(e) =>
    setNewListing({
      ...newListing,
      annualRevenue: {
        ...newListing.annualRevenue,
        reportingYear: e.target.value,
      },
    })
  }
  placeholder="Enter Year (e.g. 2024)"
/>

</div>


 {/* Latest EBITDA */}
      <div className="listing__creation_field_col md:col-4">
        <label>Latest EBITDA </label>
        <InputNumber
          value={newListing.latestEBITDA}
          onValueChange={(e) => setNewListing({ ...newListing, latestEBITDA: e.value })}
      
        />
      </div>


 {/* Latest SDE */}
      <div className="listing__creation_field_col md:col-4">
        <label>Latest SDE </label>
        <InputNumber
          value={newListing.latestSDE}
          onValueChange={(e) => setNewListing({ ...newListing, latestSDE: e.value })}
    
        />
      </div>





      {/* Latest Cash Flow */}
      <div className="listing__creation_field_col md:col-4">
        <label>Latest Cash Flow </label>
        <InputNumber
          value={newListing.cashFlow}
          onValueChange={(e) => setNewListing({ ...newListing, cashFlow: e.value })}
       
        />
      </div>




      {/* Latest NetProfit */}
      <div className="listing__creation_field_col md:col-4">
        <label>Latest Net Profit </label>
        <InputNumber
          value={newListing.latestNetProfit}
          onValueChange={(e) => setNewListing({ ...newListing, latestNetProfit: e.value })}
        
        />
      </div>







{/* ********************************************************************************* */}

    </div>

              {/* Action Buttons */}
              <div className="listing__creation_block_main_action_btn">
                <Button
                  label="Cancel"
                  icon="pi pi-times"
                  className="p-button-secondary"
                  onClick={() => setShowCreateDialog(false)}
                />
                <Button
                  label="Save & Continue"
                  icon="pi pi-check"
                  className="p-button-success"
                  onClick={handleCreateListing}
                />
              </div>
            </div>
            </>
             )}
             {listingStep === 1 && (
              <>
              <div className="dashboard__header_block">
              <h3 className="heading__Digital_CIM">
                Upload Key Business Files
              </h3>

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

            <div className="brief__infor_content">
              <p>
                Upload core documents that support your CIM and buyer evaluation process. These files remain private and can be selectively shared later.
              </p>
            </div>
  <div className="listing__upload_files_wrap">

      <div className="listing__upload_files_grid">
       <div className="listing__upload_files_grid_wrap">
         <div className="listing__upload_files_uplosdFile">
          <label>Profit &amp; Loss Statement </label>
          <FileUpload 
            mode="basic"
            accept=".pdf"
            auto
            maxFileSize={10000000}
            customUpload
            chooseLabel="File Upload"
            uploadHandler={(e) => handleFileUpload(e.files[0], "Profit Loss")}
          />
        </div>

        <div className="listing__upload_files_uplosdFile">
          <label>Balance Sheet </label>
          <FileUpload
            mode="basic"
            accept=".pdf"
            auto
            maxFileSize={10000000}
            customUpload
            chooseLabel="File Upload"
            uploadHandler={(e) => handleFileUpload(e.files[0], "Balance Sheet")}
          />
        </div>

        <div className="listing__upload_files_uplosdFile ">
          <label>3 Years of Tax Returns </label>
          <FileUpload
            mode="basic"
            accept=".pdf"
            auto
            maxFileSize={10000000}
            customUpload
            chooseLabel="File Upload"
            uploadHandler={(e) => handleFileUpload(e.files[0], "Three Year Tax Return")}
          />
        </div>

        <div className="listing__upload_files_uplosdFile ">
          <label>Ownership or Cap Table </label>
          <FileUpload
            mode="basic"
            accept=".pdf"
            auto
            maxFileSize={10000000}
            customUpload
            chooseLabel="File Upload"
            uploadHandler={(e) => handleFileUpload(e.files[0], "Ownership or Cap Table")}
          />
        </div>
     <div className="extraImage_wrap">
         <div className="listing__upload_files_uploadFile">
  <label>Listing Extra Image 1</label>
  <FileUpload
    mode="basic"
    accept="image/*"
    auto
    maxFileSize={5000000}
    customUpload
    chooseLabel="Upload"
    uploadHandler={(e) => handleFileUpload(e.files[0], "listingImage1")}
  />
</div>

<div className="listing__upload_files_uploadFile">
   <label>Listing Extra Image 2</label>
  <FileUpload
    mode="basic"
    accept="image/*"
    auto
    maxFileSize={5000000}
    customUpload
    chooseLabel="Upload"
    uploadHandler={(e) => handleFileUpload(e.files[0], "listingImage2")}
  />
</div>

<div className="listing__upload_files_uploadFile">
   <label>Listing Extra Image 3</label>
  <FileUpload
    mode="basic"
    accept="image/*"
    auto
    maxFileSize={5000000}
    customUpload
    chooseLabel="Upload"
    uploadHandler={(e) => handleFileUpload(e.files[0], "listingImage3")}
  />
</div>

<div className="listing__upload_files_uploadFile">
   <label>Listing Extra Image 4</label>
  <FileUpload
    mode="basic"
    accept="image/*"
    auto
    maxFileSize={5000000}
    customUpload
    chooseLabel="Upload"
    uploadHandler={(e) => handleFileUpload(e.files[0], "listingImage4")}
  />
</div>

<div className="listing__upload_files_uploadFile">
   <label>Listing Extra Image 5</label>
  <FileUpload
    mode="basic"
    accept="image/*"
    auto
    maxFileSize={5000000}
    customUpload
    chooseLabel="Upload"
    uploadHandler={(e) => handleFileUpload(e.files[0], "listingImage5")}
  />
</div>

     </div>
       </div>
      </div>

      <div className="listing__upload_files_submit_btn">
        

        <Button
                  label="Submit & Continue"
                  icon="pi pi-check"
                  className="p-button-success"
                  onClick={handleSubmit}
                />
      </div>
    </div>
             </>
)}

          </>
        ) : (
          <>
            <div className="dashboard__header_block">
              <h3>My Listing</h3>

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

            <div className="brief__infor_content">
              <p>
                Manage all your business listings. View, edit, publish, and
                control buyer CIM access for each listing.
              </p>
            </div>
            {/* Top Filters + Create Button */}
            <div className="my__listing_render_table_filters">
              <span className="p-input-icon-left">
                <i className="pi pi-search" />
                <InputText
                  value={filters.search}
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, search: e.target.value }))
                  }
                  placeholder="Search Listing"
                />
              </span>

              <Dropdown
                value={filters.industry}
                options={industryOptions}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, industry: e.value }))
                }
                placeholder="Industry"
              />

              <Dropdown
                value={filters.status}
                options={[
                  { label: "Live", value: "live" },
                  { label: "Inactive", value: "inactive" },
                ]}
                onChange={(e) => setFilters((f) => ({ ...f, status: e.value }))}
                placeholder="Status"
              />

              <InputText
                value={filters.year || ""}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, year: e.target.value }))
                }
                placeholder="Year"
              />

              <InputText
                value={filters.location || ""}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, location: e.target.value }))
                }
                placeholder="Location"
              />

              <Calendar
                value={filters.lastEdited}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, lastEdited: e.value }))
                }
                placeholder="Last Edited"
                showIcon
              />
              <Button
                label="Clear Filters"
                icon="pi pi-filter-slash"
                className="btnClearFilter"
                onClick={() =>
                  setFilters({
                    search: "",
                    industry: null,
                    status: null,
                    year: null,
                    location: null,
                    lastEdited: null,
                  })
                }
              />

              <Button
                label="Create Listing"
                icon="pi pi-plus"
                className="btn__crt_listing"
                onClick={() => setShowCreateDialog((prev) => !prev)}
              />
            </div>
            {/* Data Table */}
            <div className="my__save_listing_wrap my__listing_table">
              
          <DataTable
              value={filteredListings}
              paginator
              rows={10}
              loading={loading}
              responsiveLayout="scroll"
              className="listing__main_wrap"
            >
              <Column header="Listing Name dada" body={listingNameTemplate} />
              <Column header="Industry" body={industryTemplate} />
              <Column field="yearStablished" header="Year" />
              <Column header="Location" body={locationTemplate} />
              <Column field="revenue" header="Revenue" body={moneyTemplate} />
              <Column
                field="askingPrice"
                header="Asking Price"
                body={moneyTemplate}
              />
              <Column header="Last Edited" body={dateTemplate} />
              
              <Column
                field="cimStatus"
                header="CIM Status"
                body={cimTemplate}
              />
              <Column body={(filteredListings) => documentRoomLink(filteredListings._id)} header="Document Room" />
              <Column body={(filteredListings) => createCIMList(filteredListings._id, filteredListings.cimUrl)} header="CIM View" />
              <Column header="Action" body={actionTemplate} />
            </DataTable>
            </div>
            
          </>
        )}
      </div>
    </>
  );
}
