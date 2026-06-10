import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Toast } from "primereact/toast";
import { InputText } from "primereact/inputtext";
import { useRecoilValue, useSetRecoilState,useRecoilState } from "recoil";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { authState, apiBaseUrlState, usStatesState,countiesState,usCountiesByState } from "../../../recoil/ctaState";
import DashboardHeader from "./DashboardHeaderBlock";
import FileUploader from "../../customcomponent/FileUploader";
import { Dropdown } from "primereact/dropdown";
import { InputMask } from "primereact/inputmask";
import { Editor } from 'primereact/editor';
import CardSetupProcess from "./CardSetupProcess";

const BrokerProfile = () => {
  const toast = useRef(null);
  const [cardUpdatePopup, setCardUpdatePopup] = useState(false);
  const { access_token, user } = useRecoilValue(authState) ?? {};
  const API_BASE = useRecoilValue(apiBaseUrlState);
  const usStates = useRecoilValue(usStatesState);
  const [loading, setLoading] = useState(true);
  const [dirty, setDirty] = useState(false);
const [counties, setCounties] = useRecoilState(countiesState);

  const industryFocusOptions = [
    { label: "Technology", value: "technology" },
    { label: "Real Estate", value: "real_estate" },
    { label: "Healthcare", value: "healthcare" }
  ];

  const serviceOfferingOptions = [
    { label: "M&A Advisory", value: "ma_advisory" },
    { label: "Valuation", value: "valuation" },
    { label: "Brokerage", value: "brokerage" }
  ];

  const createNewBusinessBlock = () => ({
    companyName: "",
    companyWebsite: "",
    companyLogo: "",
    industryFocus: "",
    yearEstablished: null,
    serviceOffering: "",
    servicesDelivered: "",
    servicesExamplePdf: ""
  });

  const createNewServiceArea = () => ({
    state: "",
    county: ""
  });

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    streetAddress: "",
    streetAddress2: "",
    city: "",
    state: "",
    zipCode: "",
    brokerProfileImage: "",
    affiliations: "",
    certifications: "",
    linkedIn: "",
    facebook: "",
    otherSocial: "",
    
    // Section 2 Dynamic Blocks
    businessBlocks: [createNewBusinessBlock()],
    
    // New Dynamic Row Area (Max 5)
    serviceAreas: [createNewServiceArea()],
    
    // New Deal Size Sub-section
    dealSizeMin: "",
    dealSizeMax: "",

    servicesOverview: ""
  });

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
    if (!access_token) return;

    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${access_token}` },
        });

        const data = res.data;

        if (data) {
          const mappedBlocks = data.profile?.businessBlocks?.map(block => ({
            ...block,
            yearEstablished: block.yearEstablished ? new Date(block.yearEstablished) : null
          })) || [createNewBusinessBlock()];

          setFormData({
            fullName: `${data.first_name || ""} ${data.last_name || ""}`.trim(),
            phone: data.profile?.phone_number || "",
            streetAddress: data.profile?.streetAddress || "",
            streetAddress2: data.profile?.streetAddress2 || "",
            city: data.profile?.location || "",
            state: data.profile?.state || "",
            zipCode: data.profile?.zipCode || "",
            brokerProfileImage: data.profile?.brokerProfileImage || "",
            affiliations: data.profile?.affiliations || "",
            certifications: data.profile?.certifications || "",
            linkedIn: data.profile?.linkedIn || "",
            facebook: data.profile?.facebook || "",
            otherSocial: data.profile?.otherSocial || "",
            
            businessBlocks: mappedBlocks,
            serviceAreas: data.profile?.serviceAreas || [createNewServiceArea()],
            dealSizeMin: data.profile?.dealSizeMin || "",
            dealSizeMax: data.profile?.dealSizeMax || "",
            
            servicesOverview: data.profile?.servicesOverview || ""
          });
        }
      } catch (err) {
        console.error("Profile fetch failed", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [access_token, API_BASE]);

  const handleContactChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setDirty(true);
  };

  const handleBlockFieldChange = (index, fieldName, value) => {
    const updatedBlocks = [...formData.businessBlocks];
    updatedBlocks[index][fieldName] = value;
    setFormData((prev) => ({ ...prev, businessBlocks: updatedBlocks }));
    setDirty(true);
  };

  const addBusinessBlock = () => {
    setFormData((prev) => ({
      ...prev,
      businessBlocks: [...prev.businessBlocks, createNewBusinessBlock()]
    }));
    setDirty(true);
  };

  const removeBusinessBlock = (index) => {
    const updatedBlocks = formData.businessBlocks.filter((_, i) => i !== index);
    setFormData((prev) => ({
      ...prev,
      businessBlocks: updatedBlocks.length ? updatedBlocks : [createNewBusinessBlock()]
    }));
    setDirty(true);
  };

  // Service Area Dynamic Row Handlers
  const handleServiceAreaChange = (index, fieldName, value) => {
    const updatedAreas = [...formData.serviceAreas];
    updatedAreas[index][fieldName] = value;
    setFormData((prev) => ({ ...prev, serviceAreas: updatedAreas }));
    setDirty(true);
  };

  const addServiceAreaRow = () => {
    if (formData.serviceAreas.length >= 5) return;
    setFormData((prev) => ({
      ...prev,
      serviceAreas: [...prev.serviceAreas, createNewServiceArea()]
    }));
    setDirty(true);
  };

  const removeServiceAreaRow = (index) => {
    const updatedAreas = formData.serviceAreas.filter((_, i) => i !== index);
    setFormData((prev) => ({
      ...prev,
      serviceAreas: updatedAreas.length ? updatedAreas : [createNewServiceArea()]
    }));
    setDirty(true);
  };

  const handleBase64Upload = (fieldName, file, isBlockField = false, index = null) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (isBlockField) {
        handleBlockFieldChange(index, fieldName, reader.result);
      } else {
        handleContactChange(fieldName, reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const buildPayload = () => {
    const [first_name = "", last_name = ""] = formData.fullName.split(" ");
    return {
      first_name,
      last_name,
      email: user?.email,
      profile: {
        phone_number: formData.phone,
        streetAddress: formData.streetAddress,
        streetAddress2: formData.streetAddress2,
        location: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        brokerProfileImage: formData.brokerProfileImage,
        affiliations: formData.affiliations,
        certifications: formData.certifications,
        linkedIn: formData.linkedIn,
        facebook: formData.facebook,
        otherSocial: formData.otherSocial,
        businessBlocks: formData.businessBlocks,
        serviceAreas: formData.serviceAreas,
        dealSizeMin: formData.dealSizeMin,
        dealSizeMax: formData.dealSizeMax,
        servicesOverview: formData.servicesOverview
      },
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.patch(`${API_BASE}/users/profile`, buildPayload(), {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      toast.current.show({
        severity: "success",
        summary: "Success",
        detail: "Profile configuration updated successfully",
        life: 3000,
      });
      setDirty(false);
    } catch (err) {
      console.error("Profile update error", err);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to update profile",
        life: 3000,
      });
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <>
      <Toast ref={toast} />
      <DashboardHeader headingData="Broker Profile" />

      <div className="complete_buyer_form_wrap seller__form_profile">
        <form onSubmit={handleSubmit} className="form_wrap">
          
          {/* ==========================================
              SECTION 1: CONTACT INFORMATION 
             ========================================== */}
          <h2 className="form_section_title">Contact Information</h2>
          
          <div className="field form__field_col">
            <label>Email</label>
            <div className="form__field_col_hardocded_email">{user?.email}</div>
          </div>
          <div className="field form__field_col">
            <label>Full Name</label>
            <InputText value={formData.fullName} onChange={(e) => handleContactChange("fullName", e.target.value)} />
          </div>
          <div className="field form__field_col">
            <label>Phone</label>
            <InputMask mask="(999) 999-9999" placeholder="(999) 999-9999" value={formData.phone} onChange={(e) => handleContactChange("phone", e.target.value)} />
          </div>

          <div className="field form__field_col">
            <label>Street Address</label>
            <InputText value={formData.streetAddress} onChange={(e) => handleContactChange("streetAddress", e.target.value)} />
          </div>
          <div className="field form__field_col">
            <label>Street Address 2</label>
            <InputText value={formData.streetAddress2} onChange={(e) => handleContactChange("streetAddress2", e.target.value)} />
          </div>
          <div className="field form__field_col">
            <label>City</label>
            <InputText value={formData.city} onChange={(e) => handleContactChange("city", e.target.value)} />
          </div>

          <div className="field form__field_col">
            <label>State</label>
            <Dropdown value={formData.state || null} options={usStates} optionLabel="label" optionValue="value" placeholder="Select State" onChange={(e) => handleContactChange("state", e.value)} className="w-full" />
          </div>
          <div className="field form__field_col">
            <label>Zip Code</label>
            <InputMask mask="99999" value={formData.zipCode} onChange={(e) => handleContactChange("zipCode", e.target.value)} placeholder="Enter Zip Code" />
          </div>
          <div className="field form__field_col">
            <label>Broker Profile Image</label>
            <FileUploader accept="image/png, image/jpeg" maxSizeMB={0.5} existingFileUrl={formData.brokerProfileImage || "dss"} onFileSelect={(file) => handleBase64Upload("brokerProfileImage", file)} />
          </div>

          <div className="field form__field_col">
            <label>Affiliations</label>
            <InputText value={formData.affiliations} onChange={(e) => handleContactChange("affiliations", e.target.value)} placeholder="Enter Affiliations" />
          </div>
          <div className="field form__field_col">
            <label>Certifications</label>
            <InputText value={formData.certifications} onChange={(e) => handleContactChange("certifications", e.target.value)} placeholder="Enter Certifications" />
          </div>

          <h3 className="form_subsection_title">Social Links</h3>
          <div className="field form__field_col">
            <label>LinkedIn</label>
            <InputText value={formData.linkedIn} onChange={(e) => handleContactChange("linkedIn", e.target.value)} placeholder="LinkedIn URL" />
          </div>
          <div className="field form__field_col">
            <label>Facebook</label>
            <InputText value={formData.facebook} onChange={(e) => handleContactChange("facebook", e.target.value)} placeholder="Facebook URL" />
          </div>
          <div className="field form__field_col">
            <label>Other</label>
            <InputText value={formData.otherSocial} onChange={(e) => handleContactChange("otherSocial", e.target.value)} placeholder="Other social profile" />
          </div>

          {/* ========================================================
              SECTION 2: DYNAMIC SIDE-BY-SIDE FLEX BOX TILES
             ======================================================== */}
          <div className="business_blocks_flex_container">
            {formData.businessBlocks.map((block, index) => (
              <div key={index} className="business_overview_card_tile">
                
               <div className="tile_content_wrap">
                 <div className="card_tile_header">
                  <h3 className="tile_title">
                    Business and Service Overview
                  </h3>
                  {index > 0 && (
                    <Button 
                      type="button" 
                      icon="pi pi-trash" 
                      className="p-button-danger p-button-text p-button-sm" 
                      onClick={() => removeBusinessBlock(index)} 
                    />
                  )}
                </div>

                <div className="tile_field_row">
                  <div className="field">
                    <label>Company Name</label>
                    <InputText value={block.companyName} onChange={(e) => handleBlockFieldChange(index, "companyName", e.target.value)} />
                  </div>
                </div>

                <div className="tile_field_row">
                  <div className="field">
                    <label>Company Website</label>
                    <InputText value={block.companyWebsite} onChange={(e) => handleBlockFieldChange(index, "companyWebsite", e.target.value)} />
                  </div>
                </div>

                <div className="tile_field_row">
                  <div className="field">
                    <label>Company Logo</label>
                    <FileUploader accept="image/png, image/jpeg" maxSizeMB={0.5} existingFileUrl={block.companyLogo || "dss"} onFileSelect={(file) => handleBase64Upload("companyLogo", file, true, index)} />
                  </div>
                </div>

                <div className="tile_field_row">
                  <div className="field">
                    <label>Industry Focus</label>
                    <Dropdown value={block.industryFocus} options={industryFocusOptions} placeholder="Select Industry Focus" onChange={(e) => handleBlockFieldChange(index, "industryFocus", e.value)} className="w-full" />
                  </div>
                </div>

                <div className="tile_field_row">
                  <div className="field">
                    <label>Year Established</label>
                    <Calendar value={block.yearEstablished} onChange={(e) => handleBlockFieldChange(index, "yearEstablished", e.value)} view="year" dateFormat="yy" showIcon />
                  </div>
                </div>

                <div className="tile_field_row">
                  <div className="field">
                    <label>Service Offering</label>
                    <Dropdown value={block.serviceOffering} options={serviceOfferingOptions} placeholder="Select Service Offering" onChange={(e) => handleBlockFieldChange(index, "serviceOffering", e.value)} className="w-full" />
                  </div>
                </div>

                <div className="tile_field_row">
                  <div className="field">
                    <label>Services Delivered</label>
                    <InputText value={block.servicesDelivered} placeholder="Valuation" onChange={(e) => handleBlockFieldChange(index, "servicesDelivered", e.target.value)} />
                  </div>
                </div>

                <div className="tile_field_row">
                  <div className="field">
                    <label>Services Example</label>
                    <FileUploader accept="application/pdf" maxSizeMB={5} existingFileUrl={block.servicesExamplePdf || "dss"} onFileSelect={(file) => handleBase64Upload("servicesExamplePdf", file, true, index)} />
                  </div>
                </div>
               </div>

                {/* <div className="tile_action_footer">
                  {index === formData.businessBlocks.length - 1 && (
                    <Button 
                      type="button" 
                      label="Add Another +" 
                      className="p-button-primary" 
                      onClick={addBusinessBlock} 
                    />
                  )}
                </div> */}

              </div>
            ))}
          </div>

          {/* ========================================================
              NEW SECTION 3: SERVICE AREAS (ROWS WITH MAX 5 LIMIT)
             ======================================================== */}
         <div className="service_areas_section">
           <h2 className="form_section_title" style={{ marginTop: "3rem" }}>Service Areas</h2>
          
          {formData.serviceAreas.map((area, index) => (
  <div key={index} className="service_area_row">
    <div className="field form__field_col">
      <label>States</label>
      <Dropdown 
        value={area.state || null} 
        options={usStates} 
        optionLabel="label" 
        optionValue="value" 
        placeholder="Select State" 
        onChange={(e) => handleServiceAreaChange(index, "state", e.value)} 
        className="w-full" 
      />
    </div>
    
    <div className="field form__field_col">
      <label>County</label>
      <Dropdown 
        value={area.county || null} 
        /* Key Fix: Derive options from the specific row's state */
        options={usCountiesByState[area.state] || []} 
        optionLabel="label" 
        optionValue="value" 
        placeholder="Select Business County" 
        disabled={!area.state} // Disable if no state is selected
        onChange={(e) => handleServiceAreaChange(index, "county", e.value)} 
        className="w-full" 
      />
    </div>

    <div style={{ marginBottom: "2px" }}>
      {formData.serviceAreas.length > 1 && (
        <Button type="button" icon="pi pi-trash" className="p-button-danger p-button-text" onClick={() => removeServiceAreaRow(index)} />
      )}
    </div>
  </div>
))}

          {formData.serviceAreas.length < 5 && (
            <div className="add_service_area_btn">
              <Button type="button" label="Add Up to Five +" 
                      className="p-button-primary" onClick={addServiceAreaRow} />
            </div>
          )}
         </div>

          {/* ========================================================
              NEW SECTION 4: DEAL SIZE FOCUS
             ======================================================== */}
          <h2 className="form_section_title" style={{ marginTop: "2rem" }}>Deal Size Focus</h2>
          
          <div className="field form__field_col">
            <label>Minimum</label>
            <InputText value={formData.dealSizeMin} placeholder="$0" onChange={(e) => handleContactChange("dealSizeMin", e.target.value)} />
          </div>
          
          <div className="field form__field_col">
            <label>Maximum</label>
            <InputText value={formData.dealSizeMax} placeholder="$0" onChange={(e) => handleContactChange("dealSizeMax", e.target.value)} />
          </div>
          <div className="field form__field_col ">
            <label>Update Your Card</label>
            <div className="button__update_card" onClick={() => { setCardUpdatePopup(true) }}>
              Request for Card Update
            </div>
          </div>


          {/* ==========================================
              BOTTOM STATIC AREA 
             ========================================== */}
          <div className="field form__field_col col_overvice_textarea" style={{ marginTop: "3rem" }}>
            <label>Services Overview</label>
            <Editor value={formData.servicesOverview || ""} headerTemplate={editorHeader} onTextChange={(e) => handleContactChange("servicesOverview", e.htmlValue)} style={{ height: "200px" }} />
          </div>


          <div className="submit__btn_block">
            <Button label="Save Profile" type="submit" disabled={!dirty} />
          </div>
        </form>
      </div>

      {cardUpdatePopup && (
        <div className="card__update_process_popup">
          <div className="popup__added_card_overlay" onClick={() => { setCardUpdatePopup(false) }}></div>
          <CardSetupProcess />
        </div>
      )}
    </>
  );
};

export default BrokerProfile;