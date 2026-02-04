import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useRecoilValue, useSetRecoilState,useRecoilState } from "recoil";
import axios from "axios";

import { authState,apiBaseUrlState, usStatesState,
  usCountiesByState,
  selectedStateAtom,
  countiesState  } from "../../../recoil/ctaState";
import DashboardHeader from "./DashboardHeaderBlock";
import { Editor } from 'primereact/editor';
import { Toast } from "primereact/toast";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import { MultiSelect } from "primereact/multiselect";
import { Calendar } from "primereact/calendar";
import { InputSwitch } from "primereact/inputswitch";
import { RadioButton } from "primereact/radiobutton";
import { FileUpload } from "primereact/fileupload";
import { Button } from "primereact/button";
import FileUploader from "../../customcomponent/FileUploader";
import { InputMask } from "primereact/inputmask";



export default function EditBusinessListing() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useRef(null);

  const API_BASE = useRecoilValue(apiBaseUrlState);
  const {user, access_token } = useRecoilValue(authState);

  const [loading, setLoading] = useState(false);
  const [newListing, setNewListing] = useState(null);
  const states = useRecoilValue(usStatesState);
  const [selectedState, setSelectedState] = useRecoilState(selectedStateAtom);
  const [counties, setCounties] = useRecoilState(countiesState);
const [extraFiles, setExtraFiles] = useState([]);
const [extraFilesFull, setExtraFilesFull] = useState([]);

  /* ---------------------- helpers ---------------------- */
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
  const safeParse = (value, fallback) => {
    try {
      return typeof value === "string" ? JSON.parse(value) : value ?? fallback;
    } catch {
      return fallback;
    }
  };

  const handleChange = (e, field, value = e.target?.value) => {
    setNewListing((prev) => ({ ...prev, [field]: value }));
  };

  /* ---------------------- fetch listing ---------------------- */



const fetchFiles = async () => {
  try {
    const res = await axios.get(`${API_BASE}/files/${id}`);

    const mapped = {};
    res.data.forEach((file) => {
      if (/^listingImage[1-5]$/.test(file.displayName)) {
        mapped[file.displayName] = file.url;
      }
    });

    setExtraFiles(mapped);
    setExtraFilesFull(res.data);
  } catch (err) {
    console.error("Error fetching files:", err);
  }
};

const editorHeader = (
  <span className="ql-formats">
    <button className="ql-bold" />
    <button className="ql-italic" />
    <button className="ql-underline" />
    <button className="ql-list" value="ordered" />
    <button className="ql-list" value="bullet" />
    
  </span>
);


  useEffect(() => {
    if (id && access_token) fetchListing().then(() => fetchFiles());
  }, [id, access_token]);

  const fetchListing = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `${API_BASE}/business-listing/${id}`,
        { headers: { Authorization: `Bearer ${access_token}` } }
      );

      const data = res.data;

      setNewListing({
        ...data,
           industry: safeParse(data.industry, []),
        growthExpansion: safeParse(data.growthExpansion, []),
        annualRevenue: safeParse(data.annualRevenue, {}),
      });


    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };



const handleFileUpload = async (file, displayName) => {
  try {
    const existingFile = extraFilesFull.find(
      (f) => f.displayName === displayName
    );

    if (existingFile?._id) {
      await axios.delete(
        `${API_BASE}/files/${existingFile._id}`,
        { headers: { Authorization: `Bearer ${access_token}` } }
      );
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("displayName", displayName);
    formData.append("typeName", file.type);

    await axios.post(
      `${API_BASE}/files/${id}/upload`,
      formData,
      { headers: { Authorization: `Bearer ${access_token}` } }
    );

    fetchFiles();
  } catch (error) {
    console.error("Upload failed:", error);
  }
};



  /* ---------------------- update listing ---------------------- */

  const handleUpdateListing = async () => {
    try {
      setLoading(true);

      const payload = {
        ...newListing,
        industry: JSON.stringify(newListing.industry),
        growthExpansion: JSON.stringify(newListing.growthExpansion),
        annualRevenue: JSON.stringify(newListing.annualRevenue),
        isOwnerInvolved: "true",
        listingReferenceNumber: Math.random().toString(16).substring(2, 10),
      };
      await axios.patch(
        `${API_BASE}/business-listing/${id}`,
        payload,
        { headers: { Authorization: `Bearer ${access_token}` } }
      );

      toast.current.show({
        severity: "success",
        detail: "Listing updated successfully",
        life: 4000,
      });

      navigate("/user/my-listing");
    } catch (error) {
      toast.current.show({
        severity: "error",
        detail: error.message,
        life: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

useEffect(() => {
  if (newListing?.businessState) {
    setSelectedState(newListing.businessState);
    setCounties(
      usCountiesByState[newListing.businessState] || []
    );
  }
}, [newListing?.businessState]);

const usStates = useRecoilValue(usStatesState);


  /* ---------------------- image ---------------------- */

  const handleImageSelect = (e) => {
    const file = e;
    const reader = new FileReader();
    reader.onloadend = () =>
      setNewListing((p) => ({ ...p, image: reader.result }));
    reader.readAsDataURL(file);
  };

  if (!newListing) return <p>Loading...</p>;

  /* ---------------------- UI ---------------------- */

  return (
     <>
           <Toast ref={toast} />
            <DashboardHeader headingData="Edit Your Business Listing"/>
            <div className="brief__infor_content">
              <p>
                This information is used to generate your business listing and prepare your business for buyer review.
              </p>
            </div>
            <div className="">
            <div className="listing__creation_block_main_wrap">

 {/* Listing Title */}
      {/* <div className="listing__creation_field_col md:col-4">
        <label>Listing Title </label>
          <InputText
            value={newListing.listingTitle || ""}
            onChange={(e) => handleChange(e, "listingTitle", e.target.value)}
            placeholder="Enter Listing Title"
          />
      </div> */}
      {/* Business Name */}
      <div className="listing__creation_field_col md:col-4">
        <label>Listing Title <span className="required__star">*</span></label>
        <InputText
          value={newListing.listingTitle}
          onChange={(e) => handleChange(e, "listingTitle")}
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
        {/* <FileUpload
          accept="image/*"
          maxFileSize={1000000}
          customUpload
          auto
          chooseLabel="Upload Image (Max 500KB)"
           uploadHandler={(e) => {
            handleImageSelect(e);
            e.options.clear(); 
          }}
        /> */}
         <FileUploader
  accept="image/png, image/jpeg,.pdf"
  maxSizeMB={5}
  existingFileUrl={newListing.image || "dss"} // existing file from backend
  onFileSelect={(file) => handleImageSelect(file)}
/>

      </div>
{/* Listing Description */}
      <div className="listing__creation_field_col md:col-6 lisitng__text_editor">
        <label>Listing Description </label>
         <Editor
            value={newListing.listingDescription || ""}
            headerTemplate={editorHeader}
            onTextChange={(e) =>
              setNewListing({
                ...newListing,
                listingDescription: e.htmlValue,
              })
            }
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
      {/* <div className="listing__creation_field_col md:col-6">
        <label>Your Role </label>
        <Dropdown
          value={newListing.yourRole}
          options={[{ label: "Legal Owner", value: "Legal Owner" }, { label: "Broker", value: "Broker" }, { label: "Other Third Party", value: "Other Third Party" }]}
          onChange={(e) => handleChange(e, "yourRole")}
          placeholder="Select"
        />
      </div> */}



<div className="listing__creation_field_col md:col-4">
  <label>Show Contact Info on Listing </label>
  <InputSwitch
    checked={newListing.showContactOnListing}
    onChange={(e) =>
      setNewListing({ ...newListing, showContactOnListing: e.value })
    }
  />
</div>


{/* Contact Name */}
 {user?.user_type !== "seller_broker" && (
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
  ) 
//   : (
//     <div className="form__field_col_hardocded_email">
//   {user?.first_name || ""} {user?.last_name || ""}
//  </div>
//   )
  }
   {user?.user_type !== "seller_broker" && (
<div className="listing__creation_field_col md:col-6">
  <label>Contact Email </label>
    <InputText
    value={newListing.contactEmail || ""}
    onChange={(e) =>
      setNewListing({ ...newListing, contactEmail: e.target.value })
    }
    placeholder="Enter Contact Email"
  />
</div>
  ) 
//   : (
//     <div className="form__field_col_hardocded_email">
//   {user?.email || ""}
//  </div>
//   )
  }
{/* Contact Address */}
{/* <div className="listing__creation_field_col md:col-6">
  <label>Contact Address </label>
  <InputText
    value={newListing.contactAddress || ""}
    onChange={(e) =>
      setNewListing({ ...newListing, contactAddress: e.target.value })
    }
    placeholder="Enter Contact Address"
  />
</div> */}



{/* Contact Phone */}
  {user?.user_type !== "seller_broker" && (
<div className="listing__creation_field_col md:col-6">
  <label>Contact Phone</label>
    <InputMask
      mask="(999) 999-9999"
      value={newListing.contactPhone || ""}
      onChange={(e) =>
        setNewListing({ ...newListing, contactPhone: e.target.value })
      }
    />
  </div>

  )
  //  :(
  //   <div className="form__field_col_hardocded_email">
  //     {user?.profile?.phone_number || ""}
  //   </div>
  // ) 
  }

{/* 
  {user?.user_type === "seller_broker" && (
  <>
    <div className="listing__creation_field_col md:col-6">
      <label>Year In Operation</label>
        <div className="form__field_col_hardocded_email">
          {user?.profile?.years_in_operation
            ? new Date(user.profile.years_in_operation).toLocaleDateString()
            : ""}
        </div>
    </div>
    <div className="listing__creation_field_col md:col-6">
      <label>Company Website</label>
        <div className="form__field_col_hardocded_email">
          {user?.profile?.website || ""}
        </div>
    </div>
     <div className="listing__creation_field_col md:col-6">
      <label>City</label>
        <div className="form__field_col_hardocded_email">
          {user?.profile?.location || ""}
        </div>
    </div>
    <div className="listing__creation_field_col md:col-6">
      <label>State</label>
        <div className="form__field_col_hardocded_email">
          {user?.profile?.state || ""}
        </div>
    </div>
  </>
  )} */}

{/* Contact Zip Code */}
{user?.user_type !== "seller_broker" && (
<div className="listing__creation_field_col md:col-6">
  <label>Contact Zip Code </label>

    <InputMask
  id="zip"
  name="zip"
  mask="99999"
   value={`${user?.profile?.zipCode}`}
    onChange={(e) =>
      setNewListing({ ...newListing, contactZipCode: e.target.value })
    }
    placeholder="Enter Zip Code"
/>

</div>

  ) 
  // : (
  //   <div className="form__field_col_hardocded_email">
  //     {user?.profile?.zipCode || ""}
  //   </div>
  // )
  }


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
 <Dropdown
     value={newListing.businessState || null}
     options={usStates}
     optionLabel="label"
     optionValue="value"
     placeholder="Select Business State"
     onChange={(e) =>{
       setSelectedState(e.value);
            setCounties(usCountiesByState[e.value] || []);
       handleChange(e, "businessState", e.value)
     }
    }
     className="w-full"
   />
</div>

{/* Country */}
<div className="listing__creation_field_col md:col-4">
  <label> Business County </label>

 <Dropdown
  value={newListing.businessCountry || null}
  options={counties}
  optionLabel="label"
  optionValue="value"
  placeholder="Select Business County"
  onChange={(e) =>
    handleChange(e, "businessCountry", e.value)
  }
  className="w-full"
/>


</div> 

{/* Business Zip Code */}
<div className="listing__creation_field_col md:col-4">
  <label> Business Zip Code </label>
  <InputMask
    id="businessZip"
    name="businessZip"
    mask="99999"
     value={newListing.businessZipCode || ""}
      onChange={(e) =>
        setNewListing({ ...newListing, businessZipCode: e.target.value })
      }
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
      <div className="listing__creation_field_col md:col-6  lisitng__text_editor">
        <label>Reason For Selling </label>
        {/* <InputTextarea
          rows={3}
          value={newListing.reasonForSelling}
          onChange={(e) => handleChange(e, "reasonForSelling")}
        /> */}

         <Editor
                    value={newListing.reasonForSelling || ""}
                    headerTemplate={editorHeader}
                    onTextChange={(e) =>
                      setNewListing({
                        ...newListing,
                        reasonForSelling: e.htmlValue,
                      })
                    }
                  />




                  
        <em>Provide a brief explanation as to why you are selling. </em>
        
      </div>



{/* Is Franchise */}
<div className="listing__creation_field_col md:col-4">
  <label>Is Franchise </label>
   <Dropdown
            value={newListing.isFranchise}
            options={[
                { label: "Yes", value: "Yes" },
                { label: "No", value: "No" }
              ]}
            onChange={(e) => handleChange(e, "isFranchise")}
            placeholder="Select"
          />
</div>

{/* Is Relocatable */}
<div className="listing__creation_field_col md:col-4">
  <label>Is Relocatable </label>
   <Dropdown
            value={newListing.isRelocatable}
            options={[
                { label: "Yes", value: "Yes" },
                { label: "No", value: "No" }
              ]}
            onChange={(e) => handleChange(e, "isRelocatable")}
            placeholder="Select"
          />
</div>

{/* Is Startup */}
<div className="listing__creation_field_col md:col-4">
  <label>Is Startup </label>
  <Dropdown
            value={newListing.isStartup}
            options={[
                { label: "Yes", value: "Yes" },
                { label: "No", value: "No" }
              ]}
            onChange={(e) => handleChange(e, "isStartup")}
            placeholder="Select"
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
                  options={[
                    { label: "1", value: "1" }, 
                    { label: "2-5", value: "2-5" },
                    { label: "5-10", value: "5-10" },
                    { label: "10-20", value: "10-20" },
                    { label: "20-50", value: "20-50" },
                    { label: "50+ or More", value: "50+ or More" }
                  ]}
                  onChange={(e) => handleChange(e, "numberOfEmployees")}
                  placeholder="Select"
                />
      </div>

      {/* Financiing */}
        <div className="listing__creation_field_col md:col-6">
          <label>Are you willing to finance. </label>
         
                    <Dropdown
                   value={newListing.financing}
                   options={[
                     { label: "Terms to be Defined", value: "Terms to be Defined" }, 
                     { label: "No Seller Financing", value: "No Seller Financing" },
                     { label: "Dependent on Buyer Qualifications", value: "Dependent on Buyer Qualifications" }
                   ]}
                   onChange={(e) => handleChange(e, "financing")}
                   placeholder="Select"
                 />
        </div>

{/* Growth Expansion */}
<div className="listing__creation_field_col md:col-12">
  <label>Growth and Expansion  </label>
  <InputTextarea
  value={newListing.growthExpansion}
  onChange={(e) =>
    setNewListing({
      ...newListing,
      growthExpansion: e.target.value
    })
  }

  rows={6}
  cols={30}
/>
<em>Provide a description of how a new owner could grow and expand this business. </em>
</div>

{/* Facility and Location Summary */}
<div className="listing__creation_field_col md:col-6">
  <label>Facility and Location Summary </label>
  <InputTextarea
  name="facilityAndLocationDetails"
  value={newListing.facilityAndLocationDetails}
  onChange={(e) => handleChange(e, "facilityAndLocationDetails")}
   rows={6}
/>
<em>Provide a brief overview about the facility and the location of the facility. 				
Remember not to include specific address details or information that could				
impact the confidentiality of your sale.</em>
</div>

{/* Property Includedin Listing Price */}
<div className="listing__creation_field_col md:col-4">
  <label>Property Included in Sale</label>
  <div className="flex align-items-center gap-3 mt-2">
    <RadioButton
      inputId="propertyIncludedinSaleYes"
      name="propertyIncludededInSale"
      value="true"
      onChange={(e) =>
        setNewListing({ ...newListing, propertyIncludededInSale: e.value })
      }
      checked={newListing.propertyIncludededInSale == "true"}
    />
    <label htmlFor="propertyIncludedinSaleYes">Yes </label>

    <RadioButton
      inputId="propertyIncludedinSaleNo"
      name="propertyIncludededInSale"
      value="false"
      onChange={(e) =>
        setNewListing({ ...newListing, propertyIncludededInSale: e.value })
      }
      checked={newListing.propertyIncludededInSale == "false"}
    />
    <label htmlFor="propertyIncludedinSaleNo">No </label>
  </div>
</div>

{/* Property Includedin Listing Price */}
<div className="listing__creation_field_col md:col-4">
  <label>Property Included in Listing Price </label>
  <div className="flex align-items-center gap-3 mt-2">
    <RadioButton
      inputId="propertyIncludedinAskingPriceYes"
      name="propertyIncludedinAskingPrice"
      value="yes"
      onChange={(e) =>
        setNewListing({ ...newListing, propertyIncludedinAskingPrice: e.value })
      }
      checked={newListing.propertyIncludedinAskingPrice == "yes"}
    />
    <label htmlFor="propertyIncludedinAskingPriceYes">Yes </label>

    <RadioButton
      inputId="propertyIncludedinAskingPriceNo"
      name="propertyIncludedinAskingPrice"
      value="no"
      onChange={(e) =>
        setNewListing({ ...newListing, propertyIncludedinAskingPrice: e.value })
      }
      checked={newListing.propertyIncludedinAskingPrice == "no"}
    />
    <label htmlFor="propertyIncludedinAskingPriceNo">No </label>
  </div>
</div>
{/* Real Estate Value */}
<div className="listing__creation_field_col md:col-6">
  <label>Propert Value </label>
  <InputNumber
    value={newListing.propertyValue || 0}
    onValueChange={(e) =>
      setNewListing({ ...newListing, propertyValue: e.value })
    }
    mode="currency"
    currency="USD"
    minFractionDigits={0}
  maxFractionDigits={0}
    placeholder="Enter real estate value"
  />
</div>



{/* Property Leased?  */}
<div className="listing__creation_field_col md:col-4">
  <label>Property Leased? </label>
  <div className="flex align-items-center gap-3 mt-2">
    <RadioButton
      inputId="propertyLeasedYes"
      name="IsPropertyLeased"
      value="yes"
      onChange={(e) =>
        setNewListing({ ...newListing, isPropertyLeased: e.value })
      }
      checked={newListing.isPropertyLeased == "yes"}
    />
    <label htmlFor="propertyLeasedYes">Yes </label>

    <RadioButton
      inputId="propertyLeasedNo"
      name="IsPropertyLeased"
      value="no"
      onChange={(e) =>{
        setNewListing({ ...newListing, isPropertyLeased: e.value })
      }
      }
      checked={newListing.isPropertyLeased == "no"}
    />
    <label htmlFor="nonConfidential">No </label>
  </div>
</div>

{/* Monthly Rent Amount */}
<div className="listing__creation_field_col md:col-6">
  <label>Monthly Rent Amount </label>
  <InputNumber
    value={newListing.monthlyRentAmount || 0}
    onValueChange={(e) =>
      setNewListing({ ...newListing, monthlyRentAmount: e.value })
    }
    mode="currency"
    currency="USD"
    minFractionDigits={0}
  maxFractionDigits={0}
    placeholder="Enter monthly rent amount"
  />
</div>


{/* Lease Expiration */}
<div className="listing__creation_field_col md:col-4 lease__creation">
  <label>Lease Expiration</label>

  <Calendar
    value={new Date(newListing.leaseExpiration)}
    onChange={(e) =>
      setNewListing({ ...newListing, leaseExpiration: e.value })
    }
    dateFormat="mm/dd/yy"
    placeholder="MM/DD/YYYY"
    showIcon
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
    minFractionDigits={0}
  maxFractionDigits={0}
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



<div className="listing__creation_field_col md:col-6">
  <label>Inventory Value</label>
  <InputNumber
    value={newListing.inventoryValue || 0}
    onValueChange={(e) =>
      setNewListing({ ...newListing, inventoryValue: e.value })
    }
    mode="currency"
    currency="USD"
    minFractionDigits={0}
  maxFractionDigits={0}
    placeholder="Enter inventory value"
  />
</div>




{/* inventoryIncludedinAskingPrice */}
<div className="listing__creation_field_col md:col-4">
  <label>Inventory Included </label>
  <div className="flex align-items-center gap-3 mt-2">
    <RadioButton
      inputId="confidential"
      name="inventoryIncluded"
      value="true"
      onChange={(e) =>
        setNewListing({ ...newListing, inventoryIncluded: e.value })
      }
      checked={newListing.inventoryIncluded === "true"}
    />
    <label htmlFor="confidential">Yes </label>

    <RadioButton
      inputId="nonConfidential"
      name="inventoryIncluded"
      value="false"
      onChange={(e) =>
        setNewListing({ ...newListing, inventoryIncluded: e.value })
      }
      checked={newListing.inventoryIncluded === "false"}
    />
    <label htmlFor="nonConfidential">No </label>
  </div>
</div>

    


{/* Property Value */}
<div className="listing__creation_field_col md:col-6">
  <label>Revenue </label>
  <InputNumber
    value={newListing.revenue|| 0}
    onValueChange={(e) =>
      setNewListing({ ...newListing, revenue: e.value })
    }
    mode="currency"
    currency="USD"
    minFractionDigits={0}
  maxFractionDigits={0}
    placeholder="Enter Revenue"
  />
</div>





{/* Latest Reporting Year */}
{/* <div className="listing__creation_field_col md:col-6">
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

</div> */}


 {/* Latest EBITDA */}
      <div className="listing__creation_field_col md:col-4">
        <label>Latest EBITDA </label>
        <InputNumber
          value={newListing.latestEBITDA}
          onValueChange={(e) => setNewListing({ ...newListing, latestEBITDA: e.value })}
       mode="currency"
    currency="USD"
    minFractionDigits={0}
  maxFractionDigits={0}
   placeholder="Enter inventory value"
        />
      </div>







 {/* Latest SDE */}
      <div className="listing__creation_field_col md:col-4">
        <label>Latest SDE </label>
        <InputNumber
          value={newListing.latestSDE}
          onValueChange={(e) => setNewListing({ ...newListing, latestSDE: e.value })}
     mode="currency"
    currency="USD"
    minFractionDigits={0}
  maxFractionDigits={0}
        />
      </div>





      {/* Latest Cash Flow */}
      <div className="listing__creation_field_col md:col-4">
        <label>Latest Cash Flow </label>
        <InputNumber
          value={newListing.cashFlow}
          onValueChange={(e) => setNewListing({ ...newListing, cashFlow: e.value })}
        mode="currency"
    currency="USD"
    minFractionDigits={0}
  maxFractionDigits={0}
        />
      </div>




      {/* Latest NetProfit */}
      <div className="listing__creation_field_col md:col-4">
        <label>Latest Net Profit </label>
        <InputNumber
          value={newListing.latestNetProfit || 0}
          onValueChange={(e) => setNewListing({ ...newListing, latestNetProfit: e.value })}
         mode="currency"
    currency="USD"
    minFractionDigits={0}
  maxFractionDigits={0}
      placeholder="Enter Latest Net Profit "
        />
      </div>






<div className="extraImage_wrap">
        <div className="listing__upload_files_uploadFile">
          <label>Listing Extra Image 1</label>

           <FileUploader
            accept="image/png, image/jpeg"
            maxSizeMB={5}
            existingFileUrl={
                  extraFiles?.listingImage1
                    ? `${API_BASE}${extraFiles.listingImage1}`
                    : ""
                }
            onFileSelect={(file) => handleFileUpload(file, "listingImage1")}
          />

        </div>

        <div className="listing__upload_files_uploadFile">
          <label>Listing Extra Image 2</label>

          <FileUploader
            accept="image/png, image/jpeg"
            maxSizeMB={5}
            existingFileUrl={
                  extraFiles?.listingImage2
                    ? `${API_BASE}${extraFiles.listingImage2}`
                    : ""
                }
            onFileSelect={(file) => handleFileUpload(file, "listingImage2")}
          />
        </div>

        <div className="listing__upload_files_uploadFile">
          <label>Listing Extra Image 3</label>

          <FileUploader
            accept="image/png, image/jpeg"
            maxSizeMB={5}
            existingFileUrl={
                  extraFiles?.listingImage3
                    ? `${API_BASE}${extraFiles.listingImage3}`
                    : ""
                }
            onFileSelect={(file) => handleFileUpload(file, "listingImage3")}
          />
        </div>

        <div className="listing__upload_files_uploadFile">
          <label>Listing Extra Image 4</label>

          <FileUploader
            accept="image/png, image/jpeg"
            maxSizeMB={5}
            existingFileUrl={
                  extraFiles?.listingImage4
                    ? `${API_BASE}${extraFiles.listingImage4}`
                    : ""
                }
            onFileSelect={(file) => handleFileUpload(file, "listingImage4")}
          />
        </div>

        <div className="listing__upload_files_uploadFile">
          <label>Listing Extra Image 5</label>

          <FileUploader
            accept="image/png, image/jpeg"
            maxSizeMB={5}
            existingFileUrl={
                  extraFiles?.listingImage5
                    ? `${API_BASE}${extraFiles.listingImage5}`
                    : ""
                }
            onFileSelect={(file) => handleFileUpload(file, "listingImage5")}
          />
        </div>
      </div>


{/* ********************************************************************************* */}

    </div>

              {/* Action Buttons */}
              <div className="listing__creation_block_main_action_btn">
               <Button
          label="Cancel"
          className="p-button-secondary"
          onClick={() => navigate("/user/my-listing")}
        />
                <Button
                  label="Save & Continue"
                  icon="pi pi-check"
                  className="p-button-success"
                  onClick={handleUpdateListing}
                />
              </div>
            </div>
            </>
  );
}
