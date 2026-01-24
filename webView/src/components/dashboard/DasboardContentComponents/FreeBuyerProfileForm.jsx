import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useRecoilValue } from "recoil";
import { Toast } from "primereact/toast";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";

import { authState, apiBaseUrlState } from "../../../recoil/ctaState";
import DashboardHeader from "./DashboardHeaderBlock";

const FreeBuyerForm = () => {
  const toast = useRef(null);

  const { access_token, user } = useRecoilValue(authState) ?? {};
  const API_BASE = useRecoilValue(apiBaseUrlState);

  const [loading, setLoading] = useState(true);
  const [dirty, setDirty] = useState(false);

  /* ===========================
     FORM STATE (UI FRIENDLY)
  ============================ */
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    investmentBudget: "",
    industryOfInterest: "",
    regionOfInterest: "",
    businessTypePreferred: "",
    acquisitionTimeline: "",
    liquidAssets: "",
    financingPlaced: "",
    previousAcquisitionExperience: "",
    fundingPlan: "",
    financialVerification: "",
    background: "",
    ndaWilling: "",
  });

  const yesNoOptions = [
    { label: "Yes", value: "yes" },
    { label: "No", value: "no" },
  ];

  /* ===========================
     FETCH EXISTING PROFILE
  ============================ */
  useEffect(() => {
    if (!access_token) return;

    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${access_token}` },
        });

        const data = res.data;

        if (data?.profile) {
          setFormData({
            firstName: data.first_name || "",
            lastName: data.last_name || "",
            phone: data.profile.phone || "",
            investmentBudget: data.profile.investment_budget || "",
            industryOfInterest: data.profile.industry || "",
            regionOfInterest: data.profile.region || "",
            businessTypePreferred: data.profile.business_type || "",
            acquisitionTimeline: data.profile.timeline || "",
            liquidAssets: data.profile.liquid_assets || "",
            financingPlaced: data.profile.financing || "",
            previousAcquisitionExperience:
              data.profile.previous_experience || "",
            fundingPlan: data.profile.funding_plan || "",
            financialVerification:
              data.profile.financial_verification || "",
            background: data.profile.background || "",
            ndaWilling: data.profile.nda_willing || "",
          });
        }
      } catch (err) {
        console.error("Buyer profile fetch failed", err);
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

  /* ===========================
     BUILD API PAYLOAD
  ============================ */
  const buildPayload = () => ({
    first_name: formData.firstName,
    last_name: formData.lastName,
    email: user?.email,

    profile: {
      phone: formData.phone,
      investment_budget: formData.investmentBudget,
      industry: formData.industryOfInterest,
      region: formData.regionOfInterest,
      business_type: formData.businessTypePreferred,
      timeline: formData.acquisitionTimeline,
      liquid_assets: formData.liquidAssets,
      financing: formData.financingPlaced,
      previous_experience: formData.previousAcquisitionExperience,
      funding_plan: formData.fundingPlan,
      financial_verification: formData.financialVerification,
      background: formData.background,
      nda_willing: formData.ndaWilling,
    },
  });

  /* ===========================
     SUBMIT
  ============================ */
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.patch(`${API_BASE}/users/profile`, buildPayload(), {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      toast.current.show({
        severity: "success",
        summary: "Success",
        detail: "Buyer profile updated successfully",
        life: 3000,
      });

      setDirty(false);
    } catch (err) {
      console.error("Profile update error", err);
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
        Provide additional details to help sellers assess your fit. A complete
        profile increases your chances of NDA approval and unlocks advanced deal
        access.
      </div>

      <div className="complete_buyer_form_wrap">
        <form onSubmit={handleSubmit} className="form_wrap">
          {/* Email */}
          <div className="field form__field_col">
            <label>Email</label>
            <div className="form__field_col_hardocded_email">
              {user?.email}
            </div>
          </div>

          <div className="field form__field_col">
            <label>First Name</label>
            <InputText
              value={formData.firstName}
              onChange={(e) =>
                handleChange("firstName", e.target.value)
              }
            />
          </div>

          <div className="field form__field_col">
            <label>Last Name</label>
            <InputText
              value={formData.lastName}
              onChange={(e) =>
                handleChange("lastName", e.target.value)
              }
            />
          </div>

          <div className="field form__field_col">
            <label>Phone</label>
            <InputText
              value={formData.phone}
              onChange={(e) =>
                handleChange("phone", e.target.value)
              }
            />
          </div>

          <div className="field form__field_col">
            <label>Investment Budget</label>
            <InputText
              value={formData.investmentBudget}
              onChange={(e) =>
                handleChange("investmentBudget", e.target.value)
              }
            />
          </div>

          <div className="field form__field_col">
            <label>Industry of Interest</label>
            <InputText
              value={formData.industryOfInterest}
              onChange={(e) =>
                handleChange("industryOfInterest", e.target.value)
              }
            />
          </div>

          <div className="field form__field_col">
            <label>Region of Interest</label>
            <InputText
              value={formData.regionOfInterest}
              onChange={(e) =>
                handleChange("regionOfInterest", e.target.value)
              }
            />
          </div>

          <div className="field form__field_col">
            <label>Business Type Preferred</label>
            <InputText
              value={formData.businessTypePreferred}
              onChange={(e) =>
                handleChange("businessTypePreferred", e.target.value)
              }
            />
          </div>

          <div className="field form__field_col">
            <label>How Soon Looking to Acquire</label>
            <InputText
              value={formData.acquisitionTimeline}
              onChange={(e) =>
                handleChange("acquisitionTimeline", e.target.value)
              }
            />
          </div>

          <div className="field form__field_col">
            <label>Liquid Assets to Support Purchase</label>
            <InputText
              value={formData.liquidAssets}
              onChange={(e) =>
                handleChange("liquidAssets", e.target.value)
              }
            />
          </div>

          <div className="field form__field_col">
            <label>Financing is Placed</label>
            <Dropdown
              value={formData.financingPlaced}
              options={yesNoOptions}
              onChange={(e) =>
                handleChange("financingPlaced", e.value)
              }
              placeholder="Select"
            />
          </div>

          <div className="field form__field_col">
            <label>Previous Acquisition Experience</label>
            <Dropdown
              value={formData.previousAcquisitionExperience}
              options={yesNoOptions}
              onChange={(e) =>
                handleChange(
                  "previousAcquisitionExperience",
                  e.value
                )
              }
              placeholder="Select"
            />
          </div>

          <div className="field form__field_col">
            <label>How Do You Plan to Fund Your Purchase?</label>
            <InputText
              value={formData.fundingPlan}
              onChange={(e) =>
                handleChange("fundingPlan", e.target.value)
              }
            />
          </div>

          <div className="field form__field_col">
            <label>Verification of Financial Qualification</label>
            <InputText
              value={formData.financialVerification}
              onChange={(e) =>
                handleChange(
                  "financialVerification",
                  e.target.value
                )
              }
            />
          </div>

          <div className="field brief_bg_wrap">
            <label>Brief Background</label>
            <InputTextarea
              rows={3}
              autoResize
              value={formData.background}
              onChange={(e) =>
                handleChange("background", e.target.value)
              }
            />
          </div>

          <div className="field form__field_col">
            <label>Willing to Sign NDAs Digitally</label>
            <Dropdown
              value={formData.ndaWilling}
              options={yesNoOptions}
              onChange={(e) =>
                handleChange("ndaWilling", e.value)
              }
              placeholder="Select"
            />
          </div>

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
