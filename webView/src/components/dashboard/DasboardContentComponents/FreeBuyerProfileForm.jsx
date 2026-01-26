import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useRecoilValue } from "recoil";
import { Toast } from "primereact/toast";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { InputMask } from "primereact/inputmask";

import {
  authState,
  apiBaseUrlState,
  industryOptions,
  usStatesState,
} from "../../../recoil/ctaState";

import DashboardHeader from "./DashboardHeaderBlock";

const FreeBuyerForm = () => {
  const toast = useRef(null);

  const { access_token, user } = useRecoilValue(authState) ?? {};
  const API_BASE = useRecoilValue(apiBaseUrlState);
  const industryList = useRecoilValue(industryOptions);
  const usStatesList = useRecoilValue(usStatesState);

  const [loading, setLoading] = useState(true);
  const [dirty, setDirty] = useState(false);

  /* ===========================
     FORM STATE
  ============================ */
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone_number: "",
    profile: {
      phone: "",
      investment_budget: "",
      industry: "",
      region: "",
      business_type_preferred: "",
      timeline: "",
      liquid_assets: "",
      financing: "",
      previous_experience: "",
      funding_plan: "",
      financial_verification: "",
      background: "",
      nda_willing: "",
    },
    verification_file: null,
  });

  /* ===========================
     OPTIONS
  ============================ */
  const yesNoOptions = [
    { label: "Yes", value: "yes" },
    { label: "No", value: "no" },
  ];

  const acquisitionOptions = [
    { label: "Immediately", value: "immediately" },
    { label: "1–3 Months", value: "1-3_months" },
    { label: "3–6 Months", value: "3-6_months" },
    { label: "6+ Months", value: "6_plus_months" },
  ];

  /* ===========================
     FETCH PROFILE
  ============================ */
   useEffect(() => {
    console.log("Form Data Updated:", formData);

   }, [formData]);
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
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          phone_number: data.phone_number || "",
          profile: {
            phone: data.profile?.phone || "",
            investment_budget: data.profile?.investment_budget || "",
            industry: data.profile?.industry || "",
            region: data.profile?.region || "",
            business_type_preferred:
              data.profile?.business_type_preferred || "",
            timeline: data.profile?.timeline || "",
            liquid_assets: data.profile?.liquid_assets || "",
            financing: data.profile?.financing || "",
            previous_experience:
              data.profile?.previous_experience || "",
            funding_plan: data.profile?.funding_plan || "",
            financial_verification:
              data.profile?.financial_verification || "",
            background: data.profile?.background || "",
            nda_willing: data.profile?.nda_willing || "",
          },
          verification_file: null,
        });
      } catch (err) {
        console.error("Failed to fetch buyer profile", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [access_token, API_BASE]);

  /* ===========================
     HANDLERS
  ============================ */
  const updateRoot = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  };

  const updateProfile = (key, value) => {
    console.log("Updating profile key:", key, "with value:", value);
    setFormData((prev) => ({
      ...prev,
      profile: { ...prev.profile, [key]: value },
    }));
    setDirty(true);
  };

  /* ===========================
     BUILD PAYLOAD
  ============================ */
  const buildPayload = () => {
    const fd = new FormData();

    fd.append("first_name", formData.first_name);
    fd.append("last_name", formData.last_name);
    fd.append("phone_number", formData.phone_number);
    fd.append("email", user?.email);

    Object.entries(formData.profile).forEach(([key, value]) => {
      fd.append(`profile[${key}]`, value ?? "");
    });

    if (formData.verification_file) {
      fd.append("verification_file", formData.verification_file);
    }

    return fd;
  };

  /* ===========================
     SUBMIT
  ============================ */
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.patch(
        `${API_BASE}/users/profile`,
        formData,
        {
          headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
          },
        }
      );

      toast.current.show({
        severity: "success",
        summary: "Success",
        detail: "Buyer profile updated successfully",
        life: 3000,
      });

      setDirty(false);
    } catch (err) {
      console.error("Profile update failed", err);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to update buyer profile",
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

      <DashboardHeader headingData="Complete Your Buyer Profile" />

      <div className="brief__infor_content">
        Provide additional details to help sellers assess your fit.
        A complete profile increases NDA approval chances.
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

          {/* First / Last Name */}
          <div className="field form__field_col">
            <label>First Name</label>
            <InputText
              value={formData.first_name}
              onChange={(e) =>
                updateRoot("first_name", e.target.value)
              }
            />
          </div>

          <div className="field form__field_col">
            <label>Last Name</label>
            <InputText
              value={formData.last_name}
              onChange={(e) =>
                updateRoot("last_name", e.target.value)
              }
            />
          </div>

          {/* Phone */}
          <div className="field form__field_col">
            <label>Phone</label>
            <InputMask
              mask="(999) 999-9999"
              value={formData.profile.phone}
              onChange={(e) =>
                updateProfile("phone", e.target.value)
              }
            />
          </div>

          {/* Investment Budget */}
          <div className="field form__field_col">
            <label>Investment Budget</label>
            <InputText
              keyfilter="int"
              value={formData.profile.investment_budget}
              onChange={(e) =>
                updateProfile("investment_budget", e.target.value)
              }
            />
          </div>

          {/* Industry */}
          <div className="field form__field_col">
            <label>Industry of Interest</label>
            <Dropdown
              value={formData.profile.industry}
              options={industryList}
              optionLabel="label"
              optionValue="value"
              onChange={(e) =>
                updateProfile("industry", e.value)
              }
            />
          </div>

          {/* Region */}
          <div className="field form__field_col">
            <label>Region of Interest</label>
            <Dropdown
              value={formData.profile.region}
              options={usStatesList}
              optionLabel="label"
              optionValue="value"
              onChange={(e) =>
                updateProfile("region", e.value)
              }
            />
          </div>

          {/* Business Type */}
          <div className="field form__field_col">
            <label>Business Type Preferred</label>
            <InputText
              value={formData.profile.business_type_preferred}
              onChange={(e) =>
                updateProfile(
                  "business_type_preferred",
                  e.target.value
                )
              }
            />
          </div>

          {/* Timeline */}
          <div className="field form__field_col">
            <label>Acquisition Timeframe</label>
            <Dropdown
              value={formData.profile.timeline}
              options={acquisitionOptions}
              onChange={(e) =>
                updateProfile("timeline", e.value)
              }
            />
          </div>

          {/* Financial Verification */}
          <div className="field form__field_col">
            <label>Financial Verification</label>
            <Dropdown
              value={formData.profile.financial_verification}
              options={yesNoOptions}
              onChange={(e) =>
                updateProfile(
                  "financial_verification",
                  e.value
                )
              }
            />
          </div>

          {/* Upload */}
          {formData.profile.financial_verification === "yes" && (
            <div className="field form__field_col">
              <label>Upload Verification (PDF)</label>
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    verification_file: e.target.files[0],
                  }))
                }
              />
            </div>
          )}

          {/* Background */}
          <div className="field form__field_col col_overvice_textarea">
            <label>Brief Background</label>
            <InputTextarea
              rows={3}
              autoResize
              value={formData.profile.background}
              onChange={(e) =>
                updateProfile("background", e.target.value)
              }
            />
          </div>

          {/* Submit */}
          <div className="submit__btn_block">
            <Button
              label="Save Profile"
              type="submit"
              disabled={!dirty}
            />
          </div>
        </form>
      </div>
    </>
  );
};

export default FreeBuyerForm;
