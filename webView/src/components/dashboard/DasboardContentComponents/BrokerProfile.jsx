import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useRecoilValue } from "recoil";
import { Toast } from "primereact/toast";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { authState, apiBaseUrlState, usStatesState } from "../../../recoil/ctaState";
import DashboardHeader from "./DashboardHeaderBlock";
import FileUploader from "../../customcomponent/FileUploader";
import { Dropdown } from "primereact/dropdown";
import { InputMask } from "primereact/inputmask";
import { Editor } from 'primereact/editor';

const BrokerProfile = () => {
  const toast = useRef(null);

  const { access_token, user } = useRecoilValue(authState) ?? {};
  const API_BASE = useRecoilValue(apiBaseUrlState);
const usStates = useRecoilValue(usStatesState);
  const [loading, setLoading] = useState(true);
  const [dirty, setDirty] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    companyName: "",
    companyWebsite: "",
    city: "",
    state: "",
    country: "",
    zipCode: "",
    yearsInOperation: null,
    companyOverview: "",
    companyLogo: "",
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
  /* ===========================
     FETCH EXISTING PROFILE
  ============================ */
  useEffect(() => {
    if (!access_token) return;

    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${API_BASE}/auth/me`, {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        });

        const data = res.data;

        if (data) {
          setFormData({
            fullName: `${data.first_name || ""} ${data.last_name || ""}`.trim(),
            phone: data.profile?.phone_number || "",
            companyName: data.profile?.company || "",
            companyWebsite: data.profile?.website || "",
            city: data.profile?.location || "",
            state: data.profile?.state || "",
            country: "",
            zipCode: data.profile?.zipCode || "",
            yearsInOperation: data.profile?.years_in_operation
              ? new Date(data.profile.years_in_operation)
              : null,
            companyOverview: data.profile?.overview || "",
            companyLogo: data.profile?.logo || "",
            brokerProfileImage: data.profile?.brokerProfileImage || "",
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




  /* ===========================
     FORM HANDLERS
  ============================ */
  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setDirty(true);
  };

  const handleImageSelect = (file) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      handleChange("companyLogo", reader.result);
    };
    reader.readAsDataURL(file);
  };


   const handleProfileImage = (file) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      handleChange("brokerProfileImage", reader.result);
    };
    reader.readAsDataURL(file);
  };

  /* ===========================
     BUILD API PAYLOAD
  ============================ */
  const buildPayload = () => {
    const [first_name = "", last_name = ""] = formData.fullName.split(" ");
    return {
      first_name,
      last_name,
      
      email: user?.email,

      profile: {
        company: formData.companyName,
        website: formData.companyWebsite,
        location: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        phone_number: formData.phone,
        overview: formData.companyOverview,
        logo: formData.companyLogo,
        years_in_operation: formData.yearsInOperation,
        brokerProfileImage: formData.brokerProfileImage,
      },
    };
  };

  /* ===========================
     SUBMIT
  ============================ */
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.patch(`${API_BASE}/users/profile`, buildPayload(), {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });

      toast.current.show({
        severity: "success",
        summary: "Success",
        detail: "Profile updated successfully",
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

  /* ===========================
     RENDER
  ============================ */
  return (
    <>
      <Toast ref={toast} />

      <DashboardHeader headingData="Broker Profile" />

      <div className="brief__infor_content">
        Update your broker details and company information.
      </div>

      <div className="complete_buyer_form_wrap seller__form_profile">
        <form onSubmit={handleSubmit} className="form_wrap">
          {/* Email */}
          <div className="field form__field_col">
            <label>Email</label>
            <div className="form__field_col_hardocded_email">
              {user?.email}
            </div>
          </div>

          <div className="field form__field_col">
            <label>Full Name</label>
            <InputText
              value={formData.fullName}
              onChange={(e) => handleChange("fullName", e.target.value)}
            />
          </div>

          <div className="field form__field_col">
            <label>Phone</label>
            {/* <InputText
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
            /> */}

 <InputMask
      mask="(999) 999-9999"
       placeholder="(999) 999-9999"
      value={formData.phone}
      onChange={(e) =>
        handleChange("phone", e.target.value)
      }
    />


          </div>

          <div className="field form__field_col">
            <label>Company Name</label>
            <InputText
              value={formData.companyName}
              onChange={(e) => handleChange("companyName", e.target.value)}
            />
          </div>

          <div className="field form__field_col">
            <label>Company Website</label>
            <InputText
              value={formData.companyWebsite}
              onChange={(e) =>
                handleChange("companyWebsite", e.target.value)
              }
            />
          </div>

          <div className="field form__field_col">
            <label>City</label>
            <InputText
              value={formData.city}
              onChange={(e) => handleChange("city", e.target.value)}
            />
          </div>

          <div className="field form__field_col">
            <label>State</label>



  <Dropdown
    value={formData.state || null}
    options={usStates}
    optionLabel="label"
    optionValue="value"
    placeholder="Select State"
    onChange={(e) => {
      handleChange("state", e.value);
    }
    }
    className="w-full"
  />




            {/* <InputText
              value={formData.state}
              onChange={(e) => handleChange("state", e.target.value)}
            /> */}
          </div>

          <div className="field form__field_col">
            <label>Zip Code</label>
            {/* <InputText
              value={formData.zipCode}
              onChange={(e) => handleChange("zipCode", e.target.value)}
            /> */}

<InputMask
  id="zip"
  name="zip"
  mask="99999"
   value={formData.zipCode}
              onChange={(e) => handleChange("zipCode", e.target.value)} 
    placeholder="Enter Zip Code"
/>


          </div>

          <div className="field form__field_col">
            <label>Years in Operation</label>
            <Calendar
              value={formData.yearsInOperation}
              onChange={(e) =>
                handleChange("yearsInOperation", e.value)
              }
              view="year"
              dateFormat="yy"
              showIcon
            />
          </div>

          <div className="field form__field_col">
            <label>Company Logo</label>
            <FileUploader
              accept="image/png, image/jpeg"
              maxSizeMB={0.5}
              existingFileUrl={formData.companyLogo || "dss"}
              onFileSelect={handleImageSelect}
            />
          </div>

          <div className="field form__field_col">
            <label>Broker Profile Image</label>
            <FileUploader
              accept="image/png, image/jpeg"
              maxSizeMB={0.5}
              existingFileUrl={formData.brokerProfileImage || "dss"}
              onFileSelect={handleProfileImage}
            />
          </div>

          <div className="field form__field_col col_overvice_textarea">
            <label>Broker Overview</label>
              <Editor
                value={formData.companyOverview || ""}
                headerTemplate={editorHeader}
                onTextChange={(e) => handleChange("companyOverview", e.htmlValue)}
                style={{ height: "200px" }}
              />


            {/* <InputTextarea
              rows={4}
              autoResize
              value={formData.companyOverview}
              onChange={(e) =>
                handleChange("companyOverview", e.target.value)
              }
            /> */}
          </div>

          <div className="submit__btn_block">
            <Button label="Save Profile" type="submit" disabled={!dirty} />
          </div>
        </form>
      </div>
    </>
  );
};

export default BrokerProfile;
