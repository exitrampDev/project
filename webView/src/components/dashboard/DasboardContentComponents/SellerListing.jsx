import React, { useEffect, useState } from "react";
import { Card } from "primereact/card";
import { useRecoilValue } from "recoil";
import { authState } from "../../../recoil/ctaState";
import axios from "axios";
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
  const yearOptions = Array.from({ length: 101 }, (_, i) => ({ label: i, value: i }));
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
    { label: "Technology", value: "Technology" },
    { label: "Healthcare", value: "Healthcare" },
    { label: "Finance", value: "Finance" },
    { label: "Education", value: "Education" },
    { label: "Retail", value: "Retail" },
    { label: "Manufacturing", value: "Manufacturing" },
    { label: "Real Estate", value: "Real Estate" },
    { label: "Other", value: "Other" },
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
      businessName: "",
    businessType: "",
    listingTitle: "",
    listingDescription: "",
    entityType: "",
    yearStablished: "",
    city: "",
    state: "",
    country: "",
    industry: [],
    annualRevenue: {
      reportingYear: "",
      revenue: ""
    },
    askingPrice: 0,
    cashFlow: 0,
    status: "draft",
    cimStatus: "not_ready",
    briefDescription: "",
    businessOverview: "",
    keyHighlights: [],
    businessDetails: { 
      outlets: 0, 
      warehouses: 0, 
      employees: 0 
    },
    logoUrl: "",
    ownershipStructure: "",
    isOwnerInvolved: "",
    ownershipBreakdown: "",
    facilitiesOffices: "",
    numberOfEmployees: "",
    warehouseStaff: "",
    administrativeStaff: "",
    generalManager: "",
    warehouseSupervisor: "",
    revenueModel: "",
    ownerSemiInvolved: "",
    workForceDescription: "",
    keyClientsContacts: "",
    whatDoesBusinessDo: "",
    seasonalityOrTrends: "",
    anyPendingLegalMatter: "",
    growthOpportunityNarrative: [],
    yourRole: "",
    willingToCoBroker: "",
    confidentiality: "",
    contactName: "",
    contactPhone: "",
    contactEmail: "",
    contactZipCode: "",
    dbaName: "",
    legalCompanyName: "",
    stateOfFormation: "",
    naicsCode: "",
    yearsOwned: 0,
    reasonForSelling: "",
    businessAddress: "",
    workforceAllocation: [],
    averageTenureInYears: 0,
    laborMarket: "",
    workforceOverview: "",
    ownershipInvolvement: "",
    managementWillingToStay: "",
    affiliateCompanies: {
      name:"",
      description:""

    },
    growthOpportunities: [],
    ownerMessage: "",
    isFranchise: false,
    isRelocatable: false,
    isStartup: false,
    supportAndTraining: "",
    productsAndServices: "",
    productRevenueMix: [],
    industryAnalysis: "",
    competitorAnalysis: "",
    competitors: [],
    customersAndConcentration: [],
    marketingAndSalesTactics: [],
    seasonality: "",
    keySuppliers: {
      vendorName: "",
      description: "",
    },
    pendingLawsuits: false,
    pendingLawsuitsDescription: "",
    liens: false,
    liensDescription: "",
    listingReferenceNumber: Math.random().toString(16).substring(2, 10),
    physicalLocations: "",
    facilityAndLocationDetails: "",
    propertiesIncluded: [],
    ffeDescription: "",
    ffeAssets: [],
    financials: 0,
    ffEValue: 0,
    inventoryValue: 0,
    realEstateValue: 0,
    image: "",
  });

  // Fetch Listings
  const fetchListings = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:3000/business-listing", {
        headers: { Authorization: `Bearer ${access_token}` },
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
          businessName: JSON.stringify(newListing.businessName),
          growthOpportunities: JSON.stringify(newListing.growthOpportunities),
          growthOpportunityNarrative: JSON.stringify(newListing.growthOpportunityNarrative),
    };

    // Capture response here
    const response = await axios.post(
      "http://localhost:3000/business-listing",
      payload,
      {
        headers: { Authorization: `Bearer ${access_token}` },
      }
    );
console.log("payload>>>>>>>>>>",payload);
    // If you only want the response data:
    setFileListingUploadId(response.data._id);

    // reset form
    setNewListing({
       businessName: "",
    businessType: "",
    listingTitle: "",
    listingDescription: "",
    entityType: "",
    yearStablished: "",
    city: "",
    state: "",
    country: "",
    industry: [],
    annualRevenue: {
      reportingYear: "",
      revenue: ""
    },
    askingPrice: 0,
    cashFlow: 0,
    status: "draft",
    cimStatus: "not_ready",
    briefDescription: "",
    businessOverview: "",
    keyHighlights: [],
    businessDetails: { 
      outlets: 0, 
      warehouses: 0, 
      employees: 0 
    },
    logoUrl: "",
    ownershipStructure: "",
    isOwnerInvolved: "",
    ownershipBreakdown: "",
    facilitiesOffices: "",
    numberOfEmployees: "",
    warehouseStaff: "",
    administrativeStaff: "",
    generalManager: "",
    warehouseSupervisor: "",
    revenueModel: "",
    ownerSemiInvolved: "",
    workForceDescription: "",
    keyClientsContacts: "",
    whatDoesBusinessDo: "",
    seasonalityOrTrends: "",
    anyPendingLegalMatter: "",
    growthOpportunityNarrative: [],
    yourRole: "",
    willingToCoBroker: "",
    confidentiality: "",
    contactName: "",
    contactPhone: "",
    contactEmail: "",
    contactZipCode: "",
    dbaName: "",
    legalCompanyName: "",
    stateOfFormation: "",
    naicsCode: "",
    yearsOwned: 0,
    reasonForSelling: "",
    businessAddress: "",
    workforceAllocation: [],
    averageTenureInYears: 0,
    laborMarket: "",
    workforceOverview: "",
    ownershipInvolvement: "",
    managementWillingToStay: "",
    affiliateCompanies: {
      name:"",
      description:""

    },
    growthOpportunities: [],
    ownerMessage: "",
    isFranchise: false,
    isRelocatable: false,
    isStartup: false,
    supportAndTraining: "",
    productsAndServices: "",
    productRevenueMix: [],
    industryAnalysis: "",
    competitorAnalysis: "",
    competitors: [],
    customersAndConcentration: [],
    marketingAndSalesTactics: [],
    seasonality: "",
    keySuppliers: {
      vendorName: "",
      description: "",
    },
    pendingLawsuits: false,
    pendingLawsuitsDescription: "",
    liens: false,
    liensDescription: "",
    listingReferenceNumber:'',
    physicalLocations: "",
    facilityAndLocationDetails: "",
    propertiesIncluded: [],
    ffeDescription: "",
    ffeAssets: [],
    financials: 0,
    ffEValue: 0,
    inventoryValue: 0,
    realEstateValue: 0,
    image: "",
    });

    fetchListings(); // refresh table
    setListingStep(listingStep + 1);
  } catch (error) {
    console.error("Error creating listing:", error.response?.data || error.message);
  }
};



  const handleFileUpload = async (file, type) => {
 setFiles((prev) => ({ ...prev, [type]: file }));
};
const handleSubmit = async () => {
    try {
      for (const [key, file] of Object.entries(files)) {
        if (file) {
          const formData = new FormData();
          formData.append("file", file);
          await axios.post(
               `http://localhost:3000/business-listing/${fileListingUploadId}/upload/${key}`,
              formData,
              {
                headers: {
                  "Content-Type": "multipart/form-data",
                  Authorization: `Bearer ${access_token}`,
                }, 
              }
            );
        }
      }

      // redirect after uploads
      window.location.href = `http://localhost:5173/user/cim/${fileListingUploadId}`;
    } catch (error) {
      console.error("File upload failed:", error);
      alert("Failed to upload documents, please try again.");
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
    <Tag
      value={formattedStatus}
      severity={
        row.cimStatus === "ready_to_share"
          ? "success"
          : row.cimStatus === "in_progress"
          ? "warning"
          : "danger"
      }
    />
  );
};


  const locationTemplate = (row) =>
    row.city && row.state ? `${row.city}, ${row.state}` : "-";

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

  const handleDeleteListing = async (id) => {
    if (!window.confirm("Are you sure you want to delete this listing?"))
      return;

    try {
      await axios.delete(`http://localhost:3000/business-listing/${id}`, {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      // Refresh table
      fetchListings();
    } catch (error) {
      console.error("Error deleting listing:", error);
    }
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
       <Link to={`/user/cim/${row._id}`}>
         <i
          className="pi pi-file cursor-pointer text-green-500 hover:text-green-700 cim__icon_click"
          data-pr-tooltip="View CIM"
        ></i>
        <Tooltip target=".cim__icon_click" position="top" />
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
        onClick={() => handleDeleteListing(row._id)}
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

  // ==== UI ====
  return (
    <>
      <div className="my-listings-page">
        {showCreateDialog ? (
          <>
             {listingStep === 0 && (<>
            <div className="dashboard__header_block">
              <h3 className="heading__Digital_CIM">
                {" "}
                Confidential Information Memorandum
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
                This information is used to generate your Confidential Information Memorandum (CIM) and prepare your business for buyer review.
              </p>
            </div>
            <div className="">
            <div className="listing__creation_block_main_wrap">
              {/* Business Name */}
      <div className="listing__creation_field_col md:col-4">
        <label>Business Name</label>
        <InputText
          value={newListing.businessName}
          onChange={(e) => handleChange(e, "businessName")}
        />
      </div>

      {/* Business Type */}
      <div className="listing__creation_field_col md:col-4">
        <label>Business Type</label>
          <InputText
            value={newListing.businessType || ""}
            onChange={(e) => handleChange(e, "businessType", e.target.value)}
            placeholder="Enter business type"
          />
      </div>

{/* File Uploads */}
      <div className="listing__creation_field_col md:col-6">
        <label>Business Image</label>
        <FileUpload
          mode="basic"
          accept="image/*"
          customUpload
          auto
          chooseLabel="Upload Image"
          onSelect={handleImageSelect}
        />
      </div>

      {/* Business Type */}
      <div className="listing__creation_field_col md:col-4">
        <label>Listing Title</label>
          <InputText
            value={newListing.listingTitle || ""}
            onChange={(e) => handleChange(e, "listingTitle", e.target.value)}
            placeholder="Enter Listing Title"
          />
      </div>

      

      
      {/* Entity Type */}
      <div className="listing__creation_field_col md:col-4">
        <label>Entity Type</label>
        <Dropdown
          value={newListing.entityType}
          options={[
              { label: "LLC", value: "llc" },
              { label: "C-Corp", value: "c_corp" },
              { label: "S-Corp", value: "s_corp" },
              { label: "LLP", value: "llp" },
              { label: "Sole Proprietorship", value: "sole_proprietorship" },
              { label: "PLLC", value: "pllc" },
              { label: "LP", value: "lp" },
              { label: "Other", value: "other" }
            ]}
          onChange={(e) => handleChange(e, "entityType")}
          placeholder="Select"
        />
      </div>
     

      {/* Key Highlights */}
      <div className="listing__creation_field_col">
        <label>Key Highlights</label>
        <Chips
          value={newListing.keyHighlights}
          onChange={(e) => setNewListing({ ...newListing, keyHighlights: e.value })}
          separator=","
        />
      </div>

       {/* Industry */}
      <div className="listing__creation_field_col md:col-6">
        <label>Industry</label>
        <InputTextarea
          value={newListing.industry?.join(", ") || ""}
          onChange={(e) =>
            setNewListing({ ...newListing, industry: e.target.value.split(",").map(i => i.trim()) })
          }
          placeholder="Enter industries (comma separated)"
          rows={3}
          cols={30}
        />
      </div>

       {/* Industry */}
      <div className="listing__creation_field_col md:col-6">
        <label>Listing Description</label>
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


      {/* Asking Price */}
      <div className="listing__creation_field_col md:col-4">
        <label>Asking Price</label>
        <InputNumber
          value={newListing.askingPrice}
          onValueChange={(e) => setNewListing({ ...newListing, askingPrice: e.value })}
          mode="currency"
          currency="USD"
        />
      </div>

      {/* Cash Flow */}
      <div className="listing__creation_field_col md:col-4">
        <label>Cash Flow</label>
        <InputNumber
          value={newListing.cashFlow}
          onValueChange={(e) => setNewListing({ ...newListing, cashFlow: e.value })}
          mode="currency"
          currency="USD"
        />
      </div>


     

     <div className="listing__creation_field_col md:col-4">
  <label>Year Established</label>
  <Calendar
    value={newListing.yearStablished ? new Date(newListing.yearStablished) : null}
    onChange={(e) =>
      handleChange(e, "yearStablished", e.value ? e.value.getFullYear() : "")
    }
    view="year"
    dateFormat="yy"   // shows only year
    placeholder="Select Year"
    showIcon
  />
</div>
{/* Reporting Year */}
<div className="listing__creation_field_col md:col-6">
  <label>Reporting Year</label>
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

{/* Revenue */}
<div className="listing__creation_field_col md:col-6">
  <label>Revenue</label>
  <InputText
  type="number"
  value={newListing.annualRevenue?.revenue || ""}
  onChange={(e) =>
    setNewListing({
      ...newListing,
      annualRevenue: {
        ...newListing.annualRevenue,
        revenue: e.target.value,
      },
    })
  }
  placeholder="Enter Revenue"
/>

</div>

     {/* City */}
<div className="listing__creation_field_col md:col-4">
  <label>City</label>
  <InputText
    value={newListing.city || ""}
    onChange={(e) => handleChange(e, "city", e.target.value)}
    placeholder="Enter City"
  />
</div>
{/* ownershipBreakdown */}
<div className="listing__creation_field_col md:col-4">
  <label>Ownership Breakdown</label>
  <InputText
    value={newListing.ownershipBreakdown || ""}
    onChange={(e) => handleChange(e, "ownershipBreakdown", e.target.value)}
    placeholder="Ownership Breakdown"
  />
</div>

{/* State */}
<div className="listing__creation_field_col md:col-4">
  <label>State</label>
  <InputText
    value={newListing.state || ""}
    onChange={(e) => handleChange(e, "state", e.target.value)}
    placeholder="Enter State"
  />
</div>

{/* Country */}
<div className="listing__creation_field_col md:col-4">
  <label>Country</label>
  <InputText
    value={newListing.country || ""}
    onChange={(e) => handleChange(e, "country", e.target.value)}
    placeholder="Enter Country"
  />
</div>  

      {/* Ownership Structure */}
      <div className="listing__creation_field_col md:col-4">
        <label>Ownership Structure</label>
        <InputText
          value={newListing.ownershipStructure}
          onChange={(e) => handleChange(e, "ownershipStructure")}
        />
      </div>

      {/* Is Owner Involved */}
      <div className="listing__creation_field_col md:col-4">
        <label>Is Owner Involved?</label>
        <div className="flex align-items-center gap-3 mt-2">
          <RadioButton
            inputId="yes"
            name="isOwnerInvolved"
            value="yes"
            onChange={(e) =>
              setNewListing({ ...newListing, isOwnerInvolved: e.value })
            }
            checked={newListing.isOwnerInvolved === "yes"}
          />
          <label htmlFor="yes">Yes</label>
          <RadioButton
            inputId="no"
            name="isOwnerInvolved"
            value="no"
            onChange={(e) =>
              setNewListing({ ...newListing, isOwnerInvolved: e.value })
            }
            checked={newListing.isOwnerInvolved === "no"}
          />
          <label htmlFor="no">No</label>
        </div>
      </div>

      {/* Number of Employees */}
      <div className="listing__creation_field_col md:col-4">
        <label>Number of Employees</label>
        <Dropdown
          value={newListing.numberOfEmployees}
          options={[{ label: "10-50", value: "10-50" }, { label: "50-100", value: "50-100" }]}
          onChange={(e) => handleChange(e, "numberOfEmployees")}
          placeholder="Select"
        />
      </div>

      {/* Warehouse Staff */}
      <div className="listing__creation_field_col md:col-4">
        <label>Warehouse Staff</label>
        <InputNumber
          value={newListing.warehouseStaff || 0}
          onValueChange={(e) =>
            setNewListing({ ...newListing, warehouseStaff: e.value })
          }
        />
      </div>

      {/* Administrative Staff */}
      <div className="listing__creation_field_col md:col-4">
        <label>Administrative Staff</label>
        <InputNumber
          value={newListing.administrativeStaff}
          onChange={(e) => handleChange(e, "administrativeStaff")}
        />
      </div>

      {/* General Manager */}
      <div className="listing__creation_field_col md:col-6">
        <label>General Manager</label>
        <InputText
          value={newListing.generalManager}
          onChange={(e) => handleChange(e, "generalManager")}
        />
      </div>

      {/* Warehouse Supervisor */}
      <div className="listing__creation_field_col md:col-6">
        <label>Warehouse Supervisor</label>
        <InputText
          value={newListing.warehouseSupervisor}
          onChange={(e) => handleChange(e, "warehouseSupervisor")}
        />
      </div>

      {/* Revenue Model */}
      <div className="listing__creation_field_col md:col-6">
        <label>Revenue Model</label>
        <Dropdown
          value={newListing.revenueModel}
          options={[{ label: "Subscription", value: "subscription" }, { label: "Sales", value: "sales" }]}
          onChange={(e) => handleChange(e, "revenueModel")}
          placeholder="Select"
        />
      </div>
      
 <div className="listing__creation_field_col">
        <label>Brief Description</label>
        <InputTextarea
          rows={3}
          value={newListing.briefDescription}
          onChange={(e) => handleChange(e, "briefDescription")}
        />
      </div>

      {/* Business Overview */}
      <div className="listing__creation_field_col">
        <label>Business Overview</label>
        <InputTextarea
          rows={3}
          value={newListing.businessOverview}
          onChange={(e) => handleChange(e, "businessOverview")}
        />
      </div>
      {/* Ownership % Breakdown */}
      <div className="listing__creation_field_col md:col-6">
        <label>Ownership % Breakdown</label>
        <InputTextarea
          rows={3}
          value={newListing.ownerShipBreakdown}
          onChange={(e) => handleChange(e, "ownerShipBreakdown")}
        />
      </div>

      {/* Facilities / Offices */}
      <div className="listing__creation_field_col md:col-6">
        <label>Facilities / Offices</label>
        <InputTextarea
          rows={3}
          value={newListing.facilitiesOffices}
          onChange={(e) => handleChange(e, "facilitiesOffices")}
        />
      </div>

      {/* Owner (Semi-Involved) */}
      <div className="listing__creation_field_col md:col-6">
        <label>Owner (Semi-Involved)</label>
        <InputTextarea
          rows={3}
          value={newListing.ownerSemiInvolved}
          onChange={(e) => handleChange(e, "ownerSemiInvolved")}
        />
      </div>

      {/* Workforce Description */}
      <div className="listing__creation_field_col md:col-6">
        <label>Workforce Description</label>
        <InputTextarea
          rows={3}
          value={newListing.workForceDescription}
          onChange={(e) => handleChange(e, "workForceDescription")}
        />
      </div>

      {/* Key Clients / Contracts */}
      <div className="listing__creation_field_col md:col-6">
        <label>Key Clients / Contracts</label>
        <InputTextarea
          rows={3}
          value={newListing.keyClientsContacts}
          onChange={(e) => handleChange(e, "keyClientsContacts")}
        />
      </div>

      {/* What does your business do? */}
      <div className="listing__creation_field_col md:col-6">
        <label>What does your business do?</label>
        <InputTextarea
          rows={3}
          value={newListing.whatDoseBusinessDo}
          onChange={(e) => handleChange(e, "whatDoseBusinessDo")}
        />
      </div>

      {/* Seasonality or Trends */}
      <div className="listing__creation_field_col md:col-6">
        <label>Seasonality or Trends</label>
        <InputTextarea
          rows={3}
          value={newListing.seasonalityOrTrends}
          onChange={(e) => handleChange(e, "seasonalityOrTrends")}
        />
      </div>

      {/* Any Pending Legal Matters? */}
      <div className="listing__creation_field_col md:col-6">
        <label>Any Pending Legal Matters?</label>
        <InputTextarea
          rows={3}
          value={newListing.anyPendingLegalMatter}
          onChange={(e) => handleChange(e, "anyPendingLegalMatter")}
        />
      </div>

      
  {/* Your Role */}
      <div className="listing__creation_field_col md:col-6">
        <label>Your Role</label>
        <Dropdown
          value={newListing.yourRole}
          options={[{ label: "Legal Owner", value: "Legal Owner" }, { label: "Broker", value: "Broker" }, { label: "Other Third Party", value: "Other Third Party" }]}
          onChange={(e) => handleChange(e, "yourRole")}
          placeholder="Select"
        />
      </div>

  {/* Willing To CoBroker */}
      <div className="listing__creation_field_col md:col-4">
        <label>Willing To CoBroker</label>
        <div className="flex align-items-center gap-3 mt-2">
          <RadioButton
            inputId="yes"
            name="willingToCoBroker"
            value="yes"
            onChange={(e) =>
              setNewListing({ ...newListing, willingToCoBroker: e.value })
            }
            checked={newListing.willingToCoBroker === "yes"}
          />
          <label htmlFor="yes">Yes</label>
          <RadioButton
            inputId="no"
            name="willingToCoBroker"
            value="no"
            onChange={(e) =>
              setNewListing({ ...newListing, willingToCoBroker: e.value })
            }
            checked={newListing.willingToCoBroker === "no"}
          />
          <label htmlFor="no">No</label>
        </div>
      </div>

  {/* Confidential */}
<div className="listing__creation_field_col md:col-4">
  <label>Confidentiality</label>
  <div className="flex align-items-center gap-3 mt-2">
    <RadioButton
      inputId="confidential"
      name="confidentiality"
      value="Yes"
      onChange={(e) =>
        setNewListing({ ...newListing, confidentiality: e.value })
      }
      checked={newListing.confidentiality === "Yes"}
    />
    <label htmlFor="confidential">Yes</label>

    <RadioButton
      inputId="nonConfidential"
      name="confidentiality"
      value="No"
      onChange={(e) =>
        setNewListing({ ...newListing, confidentiality: e.value })
      }
      checked={newListing.confidentiality === "No"}
    />
    <label htmlFor="nonConfidential">No</label>
  </div>
</div>

{/* Contact Name */}
<div className="listing__creation_field_col md:col-6">
  <label>Contact Name</label>
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
  <label>Contact Phone</label>
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
  <label>Contact Email</label>
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
  <label>Contact Zip Code</label>
  <InputText
    value={newListing.contactZipCode || ""}
    onChange={(e) =>
      setNewListing({ ...newListing, contactZipCode: e.target.value })
    }
    placeholder="Enter Zip Code"
  />
</div>

{/* DBA Name */}
<div className="listing__creation_field_col md:col-6">
  <label>Doing Business As Name</label>
  <InputText
    value={newListing.dbaName || ""}
    onChange={(e) =>
      setNewListing({ ...newListing, dbaName: e.target.value })
    }
    placeholder="Enter Doing Business As Name"
  />
</div>


{/* Legal Company Name */}
<div className="listing__creation_field_col md:col-6">
  <label>Legal Company Name</label>
  <InputText
    value={newListing.legalCompanyName || ""}
    onChange={(e) =>
      setNewListing({ ...newListing, legalCompanyName: e.target.value })
    }
    placeholder="Enter Legal Company Name"
  />
</div>

{/* State Of Formation */}
<div className="listing__creation_field_col md:col-6">
  <label>State Of Formation</label>
  <InputText
    value={newListing.stateOfFormation || ""}
    onChange={(e) =>
      setNewListing({ ...newListing, stateOfFormation: e.target.value })
    }
    placeholder="Enter State Of Formation
"
  />
</div>

{/* NAICS Code */}
<div className="listing__creation_field_col md:col-6">
  <label>NAICS Code</label>
  <InputText
    value={newListing.naicsCode || ""}
    onChange={(e) =>
      setNewListing({ ...newListing, naicsCode: e.target.value })
    }
    placeholder="Enter NAICS Code"
  />
</div>

{/* Years Owned */}
<div className="listing__creation_field_col md:col-6">
  <label>Years Owned</label>
  <Dropdown
    value={newListing.yearsOwned}
    options={yearOptions}
    onChange={(e) =>
      setNewListing({ ...newListing, yearsOwned: e.value })
    }
    placeholder="Select Years Owned"
  />
</div>


  {/* Reason For Selling */}
      <div className="listing__creation_field_col md:col-6">
        <label>Reason For Selling</label>
        <InputTextarea
          rows={3}
          value={newListing.reasonForSelling}
          onChange={(e) => handleChange(e, "reasonForSelling")}
        />
      </div>


{/* Business Address */}
<div className="listing__creation_field_col md:col-6">
  <label>Business Address</label>
  <InputText
    value={newListing.businessAddress || ""}
    onChange={(e) =>
      setNewListing({ ...newListing, businessAddress: e.target.value })
    }
    placeholder="Enter Business Address"
  />
</div>


 {/* Workforce Allocation */}
      <div className="listing__creation_field_col md:col-6">
        <label>Workforce Allocation</label>
        <Dropdown
          value={newListing.workforceAllocation}
          options={[{ label: "Owners", value: "Owners" }, { label: " Full-Time", value: " Full-Time" }, { label: "Part-Time", value: "Part-Time" }, { label: "Contractors", value: "Contractors" }]}
          onChange={(e) => handleChange(e, "workforceAllocation")}
          placeholder="Select"
        />
      </div>


{/* Average Tenure in Years */}
<div className="listing__creation_field_col md:col-6">
  <label>Average Tenure (Years)</label>
  <InputText
    type="number"
    value={newListing.averageTenureInYears || 0}
    onChange={(e) =>
      setNewListing({ ...newListing, averageTenureInYears: Number(e.target.value) })
    }
    placeholder="Enter Average Tenure"
  />
</div>

{/* Labor Market */}
<div className="listing__creation_field_col md:col-6">
  <label>Labor Market</label>
  <InputText
    value={newListing.laborMarket || ""}
    onChange={(e) =>
      setNewListing({ ...newListing, laborMarket: e.target.value })
    }
    placeholder="Enter Labour Market"
  />
</div>

{/* Work Force Overview */}
<div className="listing__creation_field_col md:col-6">
  <label>Work Force Overview</label>
  <InputTextarea
    rows={3}
    value={newListing.workforceOverview || ""}
    onChange={(e) =>
      setNewListing({ ...newListing, workforceOverview: e.target.value })
    }
    placeholder="Enter Work Force Overview"
  />
</div>

{/* Ownership Involvement */}
<div className="listing__creation_field_col md:col-6">
  <label>Ownership Involvement</label>
  <InputTextarea
    rows={3}
    value={newListing.ownershipInvolvement || ""}
    onChange={(e) =>
      setNewListing({ ...newListing, ownershipInvolvement: e.target.value })
    }
    placeholder="Enter Ownership Involvement"
  />
</div>

  {/* Management Willing to Stay */}
      <div className="listing__creation_field_col md:col-4">
        <label>Management Willing to Stay</label>
        <div className="flex align-items-center gap-3 mt-2">
          <RadioButton
            inputId="yes"
            name="ownershipInvolvement"
            value="yes"
            onChange={(e) =>
              setNewListing({ ...newListing, ownershipInvolvement: e.value })
            }
            checked={newListing.ownershipInvolvement === "yes"}
          />
          <label htmlFor="yes">Yes</label>
          <RadioButton
            inputId="no"
            name="ownershipInvolvement"
            value="no"
            onChange={(e) =>
              setNewListing({ ...newListing, ownershipInvolvement: e.value })
            }
            checked={newListing.ownershipInvolvement === "no"}
          />
          <label htmlFor="no">No</label>
        </div>
      </div>

{/* Affiliate Company Name */}
<div className="listing__creation_field_col md:col-6">
  <label>Affiliate Company Name</label>
  <InputText
    value={newListing.affiliateCompanies?.name || ""}
    onChange={(e) =>
      setNewListing({
        ...newListing,
        affiliateCompanies: {
          ...newListing.affiliateCompanies,
          name: e.target.value,
        },
      })
    }
    placeholder="Enter Company Name"
  />
</div>

{/* Affiliate Company Description */}
<div className="listing__creation_field_col md:col-6">
  <label>Affiliate Company Description</label>
  <InputTextarea
    value={newListing.affiliateCompanies?.description || ""}
    onChange={(e) =>
      setNewListing({
        ...newListing,
        affiliateCompanies: {
          ...newListing.affiliateCompanies,
          description: e.target.value,
        },
      })
    }
    placeholder="Enter Company Description"
    rows={3}
    cols={30}
  />
</div>
{/* Growth Opportunities */}
<div className="listing__creation_field_col md:col-12">
  <label>Growth Opportunities (up to 6)</label>
  <InputTextarea
  value={newListing.growthOpportunities?.join("\n") || ""}
  onChange={(e) =>
    setNewListing({
      ...newListing,
      growthOpportunities: e.target.value
        .split("\n")
        .slice(0, 6),
    })
  }

  rows={6}
  cols={30}
/>

</div>



{/* Is Franchise */}
<div className="listing__creation_field_col md:col-4">
  <label>Is Franchise</label>
  <InputSwitch
    checked={newListing.isFranchise}
    onChange={(e) =>
      setNewListing({ ...newListing, isFranchise: e.value })
    }
  />
</div>

{/* Is Relocatable */}
<div className="listing__creation_field_col md:col-4">
  <label>Is Relocatable</label>
  <InputSwitch
    checked={newListing.isRelocatable}
    onChange={(e) =>
      setNewListing({ ...newListing, isRelocatable: e.value })
    }
  />
</div>

{/* Is Startup */}
<div className="listing__creation_field_col md:col-4">
  <label>Is Startup</label>
  <InputSwitch
    checked={newListing.isStartup}
    onChange={(e) =>
      setNewListing({ ...newListing, isStartup: e.value })
    }
  />
</div>
{/* Message From Owner */}
<div className="listing__creation_field_col md:col-6">
  <label>Message From Owner</label>
  <InputTextarea
    value={newListing.ownerMessage}
    onChange={(e) =>
      setNewListing({...newListing , ownerMessage: e.target.value})
    }
    placeholder="Message From Owner"
    rows={3}
    cols={30}
  />
</div>
{/* Support and Training */}
<div className="listing__creation_field_col md:col-6">
  <label>Support and Training</label>
  <InputTextarea
    value={newListing.supportAndTraining || ""}
    onChange={(e) =>
      setNewListing({ ...newListing, supportAndTraining: e.target.value })
    }
    placeholder="Describe the support and training offered"
    rows={3}
    cols={30}
  />
</div>

{/* Products and Services */}
<div className="listing__creation_field_col md:col-6">
  <label>Products and Services</label>
  <InputTextarea
    value={newListing.productsAndServices || ""}
    onChange={(e) =>
      setNewListing({ ...newListing, productsAndServices: e.target.value })
    }
    placeholder="Describe the products and services"
    rows={3}
    cols={30}
  />
</div>

{/* Marketing & Sales Tactics */}
<div className="listing__creation_field_col md:col-12">
  <label>Marketing & Sales Tactics</label>
  <MultiSelect
    value={newListing.marketingAndSalesTactics || []}
    options={[
      { label: "Outside Sales Reps", value: "Outside Sales Reps" },
      { label: "Inside Sales Reps", value: "Inside Sales Reps" },
      { label: "Telemarketing", value: "Telemarketing" },
      { label: "Direct Mail", value: "Direct Mail" },
      { label: "Trade Show", value: "Trade Show" },
      { label: "Yellow Pages", value: "Yellow Pages" },
      { label: "Website / Organic Search", value: "Website / Organic Search" },
      { label: "Pay Per Click", value: "Pay Per Click" },
      { label: "Social Media", value: "Social Media" },
      { label: "Word of Mouth", value: "Word of Mouth" },
      { label: "Referral / Affiliate Fees", value: "Referral / Affiliate Fees" },
    ]}
    onChange={(e) =>
      setNewListing({ ...newListing, marketingAndSalesTactics: e.value })
    }
    placeholder="Select Marketing & Sales Tactics"
    display="chip"   // shows selected as chips
    className="w-full"
  />
</div>

{/* Industry Analysis */}
<div className="listing__creation_field_col md:col-6">
  <label>Industry Analysis</label>
  <InputTextarea
    value={newListing.industryAnalysis || ""}
    onChange={(e) =>
      setNewListing({ ...newListing, industryAnalysis: e.target.value })
    }
    placeholder="Enter Industry Analysis"
    rows={4}
    cols={30}
  />
</div>

{/* Competitor Analysis */}
<div className="listing__creation_field_col md:col-6">
  <label>Competitor Analysis</label>
  <InputTextarea
    value={newListing.competitorAnalysis || ""}
    onChange={(e) =>
      setNewListing({ ...newListing, competitorAnalysis: e.target.value })
    }
    placeholder="Enter Competitor Analysis"
    rows={4}
    cols={30}
  />
</div>
{/* Competitors */}
<div className="listing__creation_field_col md:col-12">
  <label>Main Competitors (up to 5)</label>

  {newListing.competitors?.map((item, index) => (
    <div key={index} className="flex gap-2 mb-2 items-center">
      {/* Competitor Name */}
      <InputText
        value={item.name || ""}
        onChange={(e) => {
          const updated = [...newListing.competitors];
          updated[index].name = e.target.value;
          setNewListing({ ...newListing, competitors: updated });
        }}
        placeholder="Competitor Name"
        className="flex-1"
      />

      {/* Description */}
      <InputText
        value={item.description || ""}
        onChange={(e) => {
          const updated = [...newListing.competitors];
          updated[index].description = e.target.value;
          setNewListing({ ...newListing, competitors: updated });
        }}
        placeholder="Description"
        className="flex-1"
      />

      {/* Remove Button */}
      <Button
        icon="pi pi-trash"
        className="p-button-danger p-button-sm trash__list_btn"
        onClick={() => {
          const updated = newListing.competitors.filter((_, i) => i !== index);
          setNewListing({ ...newListing, competitors: updated });
        }}
      />
    </div>
  ))}

  {/* Add Row Button */}
  <Button
    onClick={() => {
      if ((newListing.competitors?.length || 0) < 5) {
        setNewListing({
          ...newListing,
          competitors: [
            ...(newListing.competitors || []),
            { name: "", description: "" },
          ],
        });
      }
    }}
    className="mt-2"
    disabled={(newListing.competitors?.length || 0) >= 5}
  >
    + Add Competitor
  </Button>
</div>

{/* Customers and Concentration */}
<div className="listing__creation_field_col md:col-12">
  <label>Customers & Concentration (up to 6)</label>

  {newListing.customersAndConcentration?.map((item, index) => (
    <div key={index} className="flex gap-2 mb-2 items-center">
      {/* Customer Name / Description */}
      <InputText
        value={item.customer || ""}
        onChange={(e) => {
          const updated = [...newListing.customersAndConcentration];
          updated[index].customer = e.target.value;
          setNewListing({
            ...newListing,
            customersAndConcentration: updated,
          });
        }}
        placeholder="Customer Name / Description"
        className="flex-1"
      />

      {/* Concentration Percentage */}
      <InputText
        type="number"
        min={0}
        max={100}
        value={item.percentage || ""}
        onChange={(e) => {
          const updated = [...newListing.customersAndConcentration];
          updated[index].percentage = Number(e.target.value);
          setNewListing({
            ...newListing,
            customersAndConcentration: updated,
          });
        }}
        placeholder="%"
        className="w-24"
      />

      {/* Remove Button */}
      <Button
        icon="pi pi-trash"
        className="p-button-danger p-button-sm trash__list_btn"
        onClick={() => {
          const updated = newListing.customersAndConcentration.filter(
            (_, i) => i !== index
          );
          setNewListing({
            ...newListing,
            customersAndConcentration: updated,
          });
        }}
      />
    </div>
  ))}

  {/* Add Row Button */}
  <Button
    onClick={() => {
      if ((newListing.customersAndConcentration?.length || 0) < 6) {
        setNewListing({
          ...newListing,
          customersAndConcentration: [
            ...(newListing.customersAndConcentration || []),
            { customer: "", percentage: 0 },
          ],
        });
      }
    }}
    className="mt-2"
    disabled={(newListing.customersAndConcentration?.length || 0) >= 6}
  >
    + Add Customer
  </Button>
</div>

{/* Product Revenue Mix */}
<div className="listing__creation_field_col md:col-12">
  <label>Product Revenue Mix</label>

  {newListing.productRevenueMix?.map((item, index) => (
    <div key={index} className="flex gap-2 mb-2 items-center">
      {/* Product Line */}
      <InputText
        value={item.productLine || ""}
        onChange={(e) => {
          const updated = [...newListing.productRevenueMix];
          updated[index].productLine = e.target.value;
          setNewListing({ ...newListing, productRevenueMix: updated });
        }}
        placeholder="Enter Product Line"
        className="flex-1"
      />

      {/* Percentage */}
      <InputText
        type="number"
        value={item.percentage || ""}
        onChange={(e) => {
          const updated = [...newListing.productRevenueMix];
          updated[index].percentage = Number(e.target.value);
          setNewListing({ ...newListing, productRevenueMix: updated });
        }}
        placeholder="%"
        className="w-24"
      />

      {/* Remove Row Button */}
      <Button
        icon="pi pi-trash"
        onClick={() => {
          const updated = [...newListing.productRevenueMix];
          updated.splice(index, 1); // remove the selected row
          setNewListing({ ...newListing, productRevenueMix: updated });
        }}
        className="p-button-sm"
      >
        
      </Button>
    </div>
  ))}

  {/* Add Row Button */}
  <Button
    onClick={() =>
      setNewListing({
        ...newListing,
        productRevenueMix: [
          ...(newListing.productRevenueMix || []),
          { productLine: "", percentage: 0 }
        ]
      })
    }
  >
    + Add Revenue Stream
  </Button>
</div>

{/* Seasonality */}
<div className="listing__creation_field_col md:col-6">
  <label>Seasonality</label>
  <InputTextarea
    value={newListing.seasonality || ""}
    onChange={(e) =>
      setNewListing({ ...newListing, seasonality: e.target.value })
    }
    placeholder="Enter Seasonality"
    rows={4}
    cols={30}
  />
</div>
{/* Key Suppliers */}
<div className="listing__creation_field_col md:col-12">
  <label>Key Supplier</label>
  
  {/* Vendor Name */}
  <InputText
    value={newListing.keySuppliers?.vendorName || ""}
    onChange={(e) =>
      setNewListing({
        ...newListing,
        keySuppliers: {
          ...newListing.keySuppliers,
          vendorName: e.target.value,
        },
      })
    }
    placeholder="Enter Vendor Name"
    className="mb-2 w-full"
  />

  {/* Description */}
  <InputTextarea
    value={newListing.keySuppliers?.description || ""}
    onChange={(e) =>
      setNewListing({
        ...newListing,
        keySuppliers: {
          ...newListing.keySuppliers,
          description: e.target.value,
        },
      })
    }
    placeholder="Enter Supplier Description"
    rows={3}
    className="w-full"
  />
</div>
{/* Facility and Location Details */}
<div className="listing__creation_field_col md:col-6">
  <label>Facility and Location Details</label>
  <InputTextarea
  name="facilityAndLocationDetails"
  value={newListing.facilityAndLocationDetails}
  onChange={(e) => handleChange(e, "facilityAndLocationDetails")}
/>
</div>

{/* Pending Lawsuits */}
<div className="listing__creation_field_col md:col-12">
  <div className="flex items-center gap-2 mb-2">
    <Checkbox
      inputId="pendingLawsuits"
      checked={newListing.pendingLawsuits || false}
      onChange={(e) =>
        setNewListing({
          ...newListing,
          pendingLawsuits: e.checked,
          // reset description if unchecked
          pendingLawsuitsDescription: e.checked
            ? newListing.pendingLawsuitsDescription
            : "",
        })
      }
    />
    <label htmlFor="pendingLawsuits">Pending Lawsuits</label>
  </div>

  {newListing.pendingLawsuits && (
    <InputTextarea
      value={newListing.pendingLawsuitsDescription || ""}
      onChange={(e) =>
        setNewListing({
          ...newListing,
          pendingLawsuitsDescription: e.target.value,
        })
      }
      placeholder="Describe the pending lawsuits"
      rows={3}
      className="w-full"
    />
  )}
</div>

{/* Liens */}
<div className="listing__creation_field_col md:col-12">
  <div className="flex items-center gap-2 mb-2">
    <Checkbox
      inputId="liens"
      checked={newListing.liens || false}
      onChange={(e) =>
        setNewListing({
          ...newListing,
          liens: e.checked,
          liensDescription: e.checked ? newListing.liensDescription : "",
        })
      }
    />
    <label htmlFor="liens">Liens</label>
  </div>

  {newListing.liens && (
    <InputTextarea
      value={newListing.liensDescription || ""}
      onChange={(e) =>
        setNewListing({
          ...newListing,
          liensDescription: e.target.value,
        })
      }
      placeholder="Describe the liens"
      rows={3}
      className="w-full"
    />
  )}
</div>
{/* Physical Locations */}
<div className="listing__creation_field_col md:col-6">
  <label>Physical Locations</label>
  <Dropdown
    value={newListing.physicalLocations || "Undisclosed"}
    options={[
      { label: "Undisclosed (default)", value: "Undisclosed" },
      { label: "Yes - Single Location for all operations", value: "Single" },
      { label: "Yes - Multiple Locations", value: "Multiple" },
      { label: "No - Homebased", value: "Homebased" },
    ]}
    onChange={(e) =>
      setNewListing({ ...newListing, physicalLocations: e.value })
    }
    placeholder="Select Physical Location"
    className="w-full"
  />
</div>


{/* Financials */}
<div className="listing__creation_field_col md:col-6">
  <label>Financials</label>
  <InputNumber
    value={newListing.financials || 0}
    onValueChange={(e) =>
      setNewListing({ ...newListing, financials: e.value })
    }
    mode="currency"
    currency="USD"
    locale="en-US"
    className="w-full"
    placeholder="Enter financials value"
  />
</div>

{/* FFE Value */}
<div className="listing__creation_field_col md:col-6">
  <label>FFE Value</label>
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

{/* Inventory Value */}
<div className="listing__creation_field_col md:col-6">
  <label>Inventory Value</label>
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

<div className="listing__creation_field_col md:col-12">
  <label>Properties Included</label>
  

  {newListing.propertiesIncluded?.map((property, index) => (
    <div
      key={index}
      className="p-3 mb-3 border rounded-md bg-gray-50 flex flex-col gap-3"
    >
      {/* Location Type */}
      <div>
        <label className="block text-sm font-medium">Location Type</label>
        <Dropdown
          value={property.locationType || ""}
          options={locationOptions}
          onChange={(e) => {
            const updated = [...newListing.propertiesIncluded];
            updated[index].locationType = e.value;
            setNewListing({ ...newListing, propertiesIncluded: updated });
          }}
          placeholder="Select Location"
          className="w-full"
        />
      </div>

      {/* Usage Description */}
      <div>
        <label className="block text-sm font-medium">Usage Description</label>
        <InputText
          value={property.usageDescription || ""}
          onChange={(e) => {
            const updated = [...newListing.propertiesIncluded];
            updated[index].usageDescription = e.target.value;
            setNewListing({ ...newListing, propertiesIncluded: updated });
          }}
          placeholder="Enter usage description"
          className="w-full"
        />
      </div>

      {/* Ownership */}
      <div>
        <label className="block text-sm font-medium">Ownership</label>
        <Dropdown
          value={property.ownership || ""}
          options={ownershipOptions}
          onChange={(e) => {
            const updated = [...newListing.propertiesIncluded];
            updated[index].ownership = e.value;
            setNewListing({ ...newListing, propertiesIncluded: updated });
          }}
          placeholder="Select Ownership"
          className="w-full"
        />
      </div>

      {/* Included in Sale */}
      <div>
        <label className="block text-sm font-medium">Included in Sale?</label>
        <Dropdown
          value={property.includedInSale || ""}
          options={includedOptions}
          onChange={(e) => {
            const updated = [...newListing.propertiesIncluded];
            updated[index].includedInSale = e.value;
            setNewListing({ ...newListing, propertiesIncluded: updated });
          }}
          placeholder="Select Option"
          className="w-full"
        />
      </div>

      {/* Remove Button */}
      <Button
        icon="pi pi-trash"
        className="p-button-danger p-button-sm trash__list_btn"
        onClick={() => {
          const updated = newListing.propertiesIncluded.filter(
            (_, i) => i !== index
          );
          setNewListing({ ...newListing, propertiesIncluded: updated });
        }}
      />
    </div>
  ))}

  {/* Add New Property */}
  <Button
    onClick={() =>
      setNewListing({
        ...newListing,
        propertiesIncluded: [
          ...(newListing.propertiesIncluded || []),
          {
            locationType: "",
            usageDescription: "",
            ownership: "",
            includedInSale: "",
          },
        ],
      })
    }
  >+ Add Property</Button>




  <div className="assets__list_helptext">
    Add each property included in the sale. Specify location type, usage,
    ownership, and whether it's included in the sale.
  </div>
</div>
<div className="listing__creation_field_col md:col-12 ffe_assets_main_wrap">
  <label>FFE Assets</label>
    {newListing.ffeAssets?.map((asset, index) => (
    <div
      key={index}
      className="p-3 mb-3 border rounded-md bg-gray-50 flex flex-col gap-3"
    >
      {/* Asset Type */}
      <div>
        <label className="block text-sm font-medium">Asset Type</label>
        <Dropdown
          value={asset.assetType || ""}
          options={assetTypeOptions}
          onChange={(e) => {
            const updated = [...newListing.ffeAssets];
            updated[index].assetType = e.value;
            setNewListing({ ...newListing, ffeAssets: updated });
          }}
          placeholder="Select Asset Type"
          className="w-full"
        />
      </div>

      {/* Included / Excluded */}
      <div>
        <label className="block text-sm font-medium">Included / Excluded</label>
        <Dropdown
          value={asset.includedStatus || ""}
          options={assetsIncludedOptions}
          onChange={(e) => {
            const updated = [...newListing.ffeAssets];
            updated[index].includedStatus = e.value;
            setNewListing({ ...newListing, ffeAssets: updated });
          }}
          placeholder="Select Option"
          className="w-full"
        />
      </div>

      {/* Asset Description */}
      <div>
        <label className="block text-sm font-medium">Asset Description</label>
        <InputText
          value={asset.assetDescription || ""}
          onChange={(e) => {
            const updated = [...newListing.ffeAssets];
            updated[index].assetDescription = e.target.value;
            setNewListing({ ...newListing, ffeAssets: updated });
          }}
          placeholder="Enter description"
          className="w-full"
        />
      </div>

      {/* Estimated Value */}
<div>
  <label className="block text-sm font-medium">Estimated Value</label>
  <InputNumber
    value={asset.estimatedValue ?? 0}   // ensure it's a number
    onValueChange={(e) => {
      const updated = [...newListing.ffeAssets];
      updated[index] = {
        ...updated[index],
        estimatedValue: e.value || 0,    // keep it numeric
      };
      setNewListing((prev) => ({
        ...prev,
        ffeAssets: updated,
      }));
    }}
    mode="currency"
    currency="USD"
    locale="en-US"
    placeholder="Enter value"
    className="w-full"
  />
</div>


      {/* Remove Button */}
      <Button
      icon="pi pi-trash"
      className="p-button-danger p-button-sm trash__list_btn"
        onClick={() => {
          const updated = newListing.ffeAssets.filter((_, i) => i !== index);
          setNewListing({ ...newListing, ffeAssets: updated });
        }}
      />
    </div>
  ))}

  {/* Add New Asset */}
  <Button
    onClick={() =>
      setNewListing({
        ...newListing,
        ffeAssets: [
          ...(newListing.ffeAssets || []),
          {
            assetType: "",
            includedStatus: "",
            assetDescription: "",
            estimatedValue: null,
          },
        ],
      })
    }
  > + Add Assets</Button>
  <div className="assets__list_helptext">
    Add a list of assets with type, inclusion status, description, and estimated value.
  </div>


</div>
{/* FF&E Description */}
<div className="listing__creation_field_col md:col-6">
  <label>FF&E Description</label>
    <InputTextarea
  id="ffeDescription"
  name="ffeDescription"
  value={newListing.ffeDescription || ""}
  onChange={(e) => handleChange(e, "ffeDescription")}
  rows={5}
  cols={30}
  autoResize
  placeholder="Enter FF&E Description"
/>

</div>




{/* Real Estate Value */}
<div className="listing__creation_field_col md:col-6">
  <label>Real Estate Value</label>
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
          <label>Profit &amp; Loss Statement</label>
          <FileUpload
            mode="basic"
            accept=".pdf"
            maxFileSize={10000000}
            customUpload
            chooseLabel="File Upload"
            uploadHandler={(e) => handleFileUpload(e.files[0], "profit_loss")}
          />
        </div>

        <div className="listing__upload_files_uplosdFile">
          <label>Balance Sheet</label>
          <FileUpload
            mode="basic"
            accept=".pdf"
            maxFileSize={10000000}
            customUpload
            chooseLabel="File Upload"
            uploadHandler={(e) => handleFileUpload(e.files[0], "balance_sheet")}
          />
        </div>

        <div className="listing__upload_files_uplosdFile ">
          <label>3 Years of Tax Returns</label>
          <FileUpload
            mode="basic"
            accept=".pdf"
            maxFileSize={10000000}
            customUpload
            chooseLabel="File Upload"
            uploadHandler={(e) => handleFileUpload(e.files[0], "three_year_tax_return")}
          />
        </div>

        <div className="listing__upload_files_uplosdFile ">
          <label>Ownership or Cap Table</label>
          <FileUpload
            mode="basic"
            accept=".pdf"
            maxFileSize={10000000}
            customUpload
            chooseLabel="File Upload"
            uploadHandler={(e) => handleFileUpload(e.files[0], "ownership_or_cap_table")}
          />
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
                options={[
                  { label: "Restaurants", value: "Restaurants" },
                  { label: "Logistics", value: "Logistics" },
                  { label: "E-commerce", value: "E-commerce" },
                  { label: "Healthcare", value: "Healthcare" },
                  { label: "Finance", value: "Finance" },
                  { label: "Education", value: "Education" },
                  { label: "Real Estate", value: "Real Estate" },
                  { label: "Technology", value: "Technology" },
                  { label: "Manufacturing", value: "Manufacturing" },
                  { label: "Other", value: "Other" },
                ]}
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
                label="Create Listing"
                icon="pi pi-plus"
                className="btn__crt_listing"
                onClick={() => setShowCreateDialog((prev) => !prev)}
              />
            </div>
            {/* Data Table */}
            <div className="my__save_listing_wrap my__listing_table">
          <DataTable
              value={listings}
              paginator
              rows={10}
              loading={loading}
              responsiveLayout="scroll"
              className="listing__main_wrap"
            >
              <Column header="Listing Name" body={listingNameTemplate} />
              <Column header="Industry" body={industryTemplate} />
              <Column field="status" header="Status" body={statusTemplate} />
              <Column field="yearStablished" header="Year" />
              <Column header="Location" body={locationTemplate} />
              <Column field="revenue" header="Revenue" body={moneyTemplate} />
              <Column
                field="askingPrice"
                header="Asking Price"
                body={moneyTemplate}
              />
              <Column
                field="cimStatus"
                header="CIM Status"
                body={cimTemplate}
              />
              <Column field="views" header="Views" />
              <Column header="Last Edited" body={dateTemplate} />
              <Column header="Action" body={actionTemplate} />
            </DataTable>
            </div>
            
          </>
        )}
      </div>
    </>
  );
}
