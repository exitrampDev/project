import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useRecoilValue } from "recoil";
import { Toast } from "primereact/toast";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { FileUpload } from "primereact/fileupload";

import { authState, apiBaseUrlState } from "../../../recoil/ctaState";
import DashboardHeader from "./DashboardHeaderBlock";
import FileUploader from "../../customcomponent/FileUploader";
import { InputMask } from "primereact/inputmask";

const FreeSellerForm = () => {
  const toast = useRef(null);

  const { access_token, user } = useRecoilValue(authState) ?? {};
  const API_BASE = useRecoilValue(apiBaseUrlState);

  const [loading, setLoading] = useState(true);
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
    yearsInOperation: null,
    status: "draft",
    companyLogo: "",
    teamSummaryDocument: "",
    companyOverview: "",
  });

  /* ===========================
     FETCH PROFILE (GET)
  ============================ */
  useEffect(() => {
    if (!access_token) return;

    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${access_token}` },
        });

        const data = res.data;
        if (!data) return;

        setFormData({
          fullName: `${data.first_name || ""} ${data.last_name || ""}`.trim(),
          phone: data.profile?.phone_number || "",
          role: "",
          companyName: data.profile?.company || "",
          companyWebsite: data.profile?.website || "",
          businessType: "",
          city: data.profile?.location || "",
          state: data.profile?.state || "",
          country: "",
          zipCode: data.profile?.zipCode || "",
          yearsInOperation: data.profile?.years_in_operation
            ? new Date(data.profile.years_in_operation)
            : null,
          status: "draft",
          companyLogo: data.profile?.logo || "",
          teamSummaryDocument: "",
          companyOverview: data.profile?.overview || "",
        });
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

  const handleFileUpload = (event, field) => {
  const file =
    event instanceof File
      ? event
      : event.files?.[0] || event.originalEvent?.target?.files?.[0];

  if (!file) return;

  const reader = new FileReader();

  reader.onloadend = () => {
    console.log("file base64:", reader.result);
    // reader.result is base64 string
    handleChange(field, reader.result);
  };

  reader.readAsDataURL(file); // converts to base64
};


  /* ===========================
     BUILD PATCH PAYLOAD
  ============================ */
  const buildPayload = () => {
    const [first_name = "", last_name = ""] =
      formData.fullName.split(" ");

    return {
      first_name,
      last_name,
      email: user?.email,
      profile: {
        phone_number: formData.phone,
        company: formData.companyName,
        website: formData.companyWebsite,
        location: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        overview: formData.companyOverview,
        logo: formData.companyLogo,
        years_in_operation: formData.yearsInOperation,
      },
    };
  };

  /* ===========================
     SUBMIT (PATCH)
  ============================ */
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.patch(
        `${API_BASE}/users/profile`,
        buildPayload(),
        {
          headers: { Authorization: `Bearer ${access_token}` },
        }
      );

      toast.current.show({
        severity: "success",
        summary: "Success",
        detail: "Profile updated successfully",
        life: 3000,
      });

      setDirty(false);
    } catch (err) {
      console.error("Profile update failed", err);
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

      <DashboardHeader headingData="My Seller Profile" />

      <div className="brief__infor_content">
        Update your seller details and company information. This helps
        buyers understand who you are and improves listing visibility.
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
              onChange={(e) =>
                handleChange("fullName", e.target.value)
              }
            />
          </div>

          <div className="field form__field_col">
            <label>Phone</label>
            {/* <InputText
              value={formData.phone}
              onChange={(e) =>
                handleChange("phone", e.target.value)
              }
            /> */}

            <InputMask
                  mask="(999) 999-9999"
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
              onChange={(e) =>
                handleChange("companyName", e.target.value)
              }
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
              onChange={(e) =>
                handleChange("city", e.target.value)
              }
            />
          </div>

          <div className="field form__field_col">
            <label>State</label>
            <InputText
              value={formData.state}
              onChange={(e) =>
                handleChange("state", e.target.value)
              }
            />
          </div>

          <div className="field form__field_col">
            <label>Zip Code</label>
            <InputText
              value={formData.zipCode}
              onChange={(e) =>
                handleChange("zipCode", e.target.value)
              }
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
  accept="image/png, image/jpeg,.pdf"
  maxSizeMB={0.5}
  onFileSelect={(e) => {
                handleFileUpload(e, "companyLogo");
               
              }}  existingFileUrl={formData.companyLogo || "dss"}
/>



          </div>

          <div className="field form__field_col col_overvice_textarea">
            <label>Company Overview</label>
            <InputTextarea
              rows={4}
              autoResize
              value={formData.companyOverview}
              onChange={(e) =>
                handleChange("companyOverview", e.target.value)
              }
            />
          </div>

          <div className="submit__btn_block">
            <Button label="Save Profile" type="submit" disabled={!dirty} />
          </div>
        </form>
      </div>
    </>
  );
};

export default FreeSellerForm;
