import React, { useEffect, useState, useRef } from "react";
import { Toast } from "primereact/toast";
import { Link } from "react-router-dom";
import axios from "axios";
import { useRecoilValue } from "recoil";
import { authState,apiBaseUrlState  } from "../../../recoil/ctaState";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import { FileUpload } from "primereact/fileupload";
import notifInfo from "../../../assets/notifInfo.png";
import serachIcon from "../../../assets/serachIcon.png";
import userImg from "../../../assets/userImg.png";
import { Calendar } from "primereact/calendar";
import DashboardHeader from "./DashboardHeaderBlock";
import FileUploader from "../../customcomponent/FileUploader";

const BrokerProfile = () => {
  const { access_token } = useRecoilValue(authState) ?? {};
  const API_BASE = useRecoilValue(apiBaseUrlState);
  const user = useRecoilValue(authState).user;
  const toast = useRef(null);
  const [dirty, setDirty] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    role: "",
    companyName: "",
    companyWebsite: "",
    businessType: "",
    city: "",
    state: "",
    country: "",
    zipCode: "",
    yearsInOperation: "",
    status: "draft",
    companyLogo: "",
    teamSummaryDocument: "",
    companyOverview: "",
  });

  const [existingId, setExistingId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch existing seller data
  useEffect(() => {
    if (!access_token) return;

    axios
      .get(`${API_BASE}/free-seller`, {
        headers: { Authorization: `Bearer ${access_token}` },
      })
      .then((res) => {
        if (res.data.data[0]) {
          if (res.data.data[0]._id) {
            setExistingId(res.data.data[0]._id);
            setFormData(res.data.data[0]);
          } else if (Array.isArray(res.data) && res.data.length > 0) {
            setExistingId(res.data[0]._id);
            setFormData(res.data[0]);
          }
        }
         
      })
      .catch((err) => console.error("Error fetching data", err))
      .finally(() => setLoading(false));
  }, [access_token]);

  const handleChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setDirty(true);
  };

  // Handle file upload
   // Handle file upload
 


const handleImageSelect = (e) => {
  console.log("File selected for listing image:", e);
  const file = e;
  const reader = new FileReader();

  reader.onloadend = () => {
    handleChange("companyLogo", reader.result); 
  };

  reader.readAsDataURL(file);
};








  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("existingId PATCH", existingId);
    try {
      if (existingId) {
        await axios.patch(
          `${API_BASE}/free-seller/${existingId}`,
          formData,
          { headers: { Authorization: `Bearer ${access_token}` } }
        );
        toast.current.show({
          severity: "success",
          summary: "Success",
          detail: "Data updated successfully!",
          life: 3000,
        });
      } else {
        const res = await axios.post(
         `${API_BASE}/free-seller`,
          formData,
          { headers: { Authorization: `Bearer ${access_token}` } }
        );
        setExistingId(res.data.data[0]._id);
        toast.current.show({
          severity: "success",
          summary: "Success",
          detail: "Data created successfully!",
          life: 3000,
        });
      }
      setDirty(false);
    } catch (err) {
      console.error("Error saving data", err);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Error saving data",
        life: 3000,
      });
    }
  };

  if (loading) return <p>Loading...</p>;
const openFile = (base64Data, fileName, mimeType) => {
  const byteCharacters = atob(base64Data.split(",")[1]);
  const byteNumbers = new Array(byteCharacters.length).fill().map((_, i) =>
    byteCharacters.charCodeAt(i)
  );
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: mimeType });
  const blobUrl = URL.createObjectURL(blob);

  window.open(blobUrl, "_blank"); // safe preview
};
  return (
    <>
      <Toast ref={toast} />
   
<DashboardHeader headingData="Broker Profile"/>
      <div className="brief__infor_content">
        Update your broker details and company information. 
      </div>

      <div className="complete_buyer_form_wrap seller__form_profile">
        <form onSubmit={handleSubmit} className="form_wrap">
          {/* Email (read-only) */}
          <div className="field form__field_col">
            <label>Email</label>
            <div className="form__field_col_hardocded_email">{user?.email}</div>
          </div>

          <div className="field form__field_col">
            <label>Full Name</label>
            <InputText
            
              value={user?.fname}
              onChange={(e) => handleChange("fullName", e.target.value)}
            />
          </div>

          <div className="field form__field_col">
            <label>Phone</label>
            <InputText
            
              value={formData.phone || ""}
              onChange={(e) => handleChange("phone", e.target.value)}
            />
          </div>

          <div className="field form__field_col">
            <label>Company Name</label>
            <InputText
            
              value={formData.companyName || ""}
              onChange={(e) => handleChange("companyName", e.target.value)}
            />
          </div>

          <div className="field form__field_col">
            <label>Company Website</label>
            <InputText
              value={formData.companyWebsite || ""}
              onChange={(e) => handleChange("companyWebsite", e.target.value)}
            />
          </div>


          <div className="field form__field_col">
            <label>City</label>
            <InputText
              value={formData.city || ""}
              onChange={(e) => handleChange("city", e.target.value)}
            />
          </div>

          <div className="field form__field_col">
            <label>State</label>
            <InputText
              value={formData.state || ""}
              onChange={(e) => handleChange("state", e.target.value)}
            />
          </div>

          <div className="field form__field_col">
            <label>Country</label>
            <InputText
              value={formData.country || ""}
              onChange={(e) => handleChange("country", e.target.value)}
            />
          </div>

          <div className="field form__field_col">
            <label>Zip Code</label>
            <InputText
              value={formData.zipCode || ""}
              onChange={(e) => handleChange("zipCode", e.target.value)}
            />
          </div>

        <div className="field form__field_col field form__field_col_yearOperation_content">
          <label>Years in Operation</label>
          <Calendar
            value={ formData?.yearsInOperation ? new Date(formData.yearsInOperation) : new Date()}
            onChange={(e) => handleChange("yearsInOperation", e.value)}
            dateFormat="yy" 
            view="year"     
            showIcon        
            placeholder="Select Year"
          />
        </div>

          {/* Image Uploader */}
          <div className="field form__field_col ">
            <label>Company Logo / Image *</label>
            <div className="field__image_uploader_profile_block">
                <FileUploader
                accept="image/png, image/jpeg,.pdf"
                maxSizeMB={0.5}
                onFileSelect={(file) =>  handleImageSelect(file)}
                />  
            </div>
          </div>
    


          {/* Textarea */}
          <div className="field form__field_col col_overvice_textarea">
            <label>Broker Overview</label>
            <InputTextarea
              rows={4}
              autoResize
              value={formData.companyOverview || ""}
              onChange={(e) => handleChange("companyOverview", e.target.value)}
            />
          </div>

          <div className="submit__btn_block">
            <div className="col-12 flex justify-content-end mt-3">
              <Button label="Save Profile" type="submit" disabled={!dirty} />
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default BrokerProfile;
