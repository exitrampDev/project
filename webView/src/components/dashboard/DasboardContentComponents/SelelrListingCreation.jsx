import React, { useState } from "react";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";
import { RadioButton } from "primereact/radiobutton";
import { FileUpload } from "primereact/fileupload";
import { InputTextarea } from "primereact/inputtextarea";
import { authState,apiBaseUrlState  } from "../../../recoil/ctaState";
import { useRecoilValue } from "recoil";

import axios from "axios";

export default function SelelrListingCreation() {
  const { user, access_token } = useRecoilValue(authState) ?? {};
  const [step, setStep] = useState(1);
const API_BASE = useRecoilValue(apiBaseUrlState);
  const [step1Data, setStep1Data] = useState({
    businessName: "",
    businessType: "",
    entityType: "",
    yearEstablished: null,
    city: "",
    state: "",
    country: "",
    ownershipStructure: "",
    isOwnerInvolved: true,
    ownershipBreakdown: "",
    facilities: "",
    numberOfEmployees: "",
    warehouseStaff: "",
    adminStaff: "",
    generalManager: "",
    warehouseSupervisor: "",
    revenueModel: "",
    ownerDetails: "",
    workforceDescription: "",
    keyClients: "",
    businessDescription: "",
    seasonality: "",
    legalMatters: "",
    growthNarrative: "",
    image: "",
  });

  const [step2Data, setStep2Data] = useState({
    profitAndLoss: null,
    balanceSheet: null,
    taxReturns: null,
    capTable: null,
  });

  const handleInputChange = (key, value) => {
    setStep1Data((prev) => ({ ...prev, [key]: value }));
  };

  const handleFileUpload = (key, files) => {
    setStep2Data((prev) => ({ ...prev, [key]: files[0] }));
  };

  const handleSubmit = async () => {
    const formData = new FormData();

    Object.entries(step1Data).forEach(([key, value]) => {
      // Convert all non-null/undefined values to strings
      if (typeof value !== "object" && value !== null && value !== undefined) {
        formData.append(key, String(value));
      } else if (value instanceof Date) {
        formData.append(key, value.toISOString());
      } else {
        formData.append(key, "");
      }
    });

    Object.entries(step2Data).forEach(([key, file]) => {
      if (file) formData.append(key, file);
    });

    try {
      await axios.post(`${API_BASE}/business-listing`, formData, {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      alert("Listing submitted successfully!");
    } catch (error) {
      console.error("Submission failed:", error);
      alert("Submission failed!");
    }
  };

  const entityTypes = [
    "LLC",
    "C-Corp",
    "S-Corp",
    "LLP",
    "Sole Proprietorship",
    "PLLC",
    "LP",
    "Other",
  ].map((t) => ({ label: t, value: t }));

  const revenueModels = [
    "Subscription",
    "One-Time Sales",
    "Service Based",
    "Freemium",
    "Other",
  ].map((t) => ({ label: t, value: t }));

  const staffOptions = [...Array(100).keys()].map((num) => ({
    label: `${num}`,
    value: num,
  }));

  return (
    <div className="p-4">
      {step === 1 && (
        <div className="grid formgrid p-fluid">
          <h3>Step 1: Business Information</h3>
          <div className="field col-6">
            <label>Business Image</label>
            <FileUpload
              mode="basic"
              accept="image/*"
              maxFileSize={1000000}
              chooseLabel="Upload Image"
              auto
              customUpload
              uploadHandler={(e) => {
                const file = e.files[0];
                const reader = new FileReader();
                reader.onloadend = () => {
                  setStep1Data((prev) => ({
                    ...prev,
                    image: reader.result,
                  }));
                };
                reader.readAsDataURL(file);
              }}
              className="w-full"
            />
            {step1Data.image && (
              <img
                src={step1Data.image}
                alt="Business Preview"
                style={{ maxWidth: "200px", marginTop: "10px" }}
              />
            )}
          </div>
          <div className="field col-6">
            <label>Business Name</label>
            <InputText
              value={step1Data.businessName}
              onChange={(e) =>
                handleInputChange("businessName", e.target.value)
              }
            />
          </div>
          <div className="field col-6">
            <label>Business Type</label>
            <InputText
              value={step1Data.businessType}
              onChange={(e) =>
                handleInputChange("businessType", e.target.value)
              }
            />
          </div>
          <div className="field col-6">
            <label>Entity Type</label>
            <Dropdown
              value={step1Data.entityType}
              options={entityTypes}
              onChange={(e) => handleInputChange("entityType", e.value)}
              placeholder="Select Entity Type"
            />
          </div>
          <div className="field col-6">
            <label>Year Established</label>
            <Calendar
              value={step1Data.yearEstablished}
              onChange={(e) => handleInputChange("yearEstablished", e.value)}
              view="year"
              dateFormat="yy"
              placeholder="Year"
            />
          </div>
          <div className="field col-4">
            <label>City</label>
            <InputText
              value={step1Data.city}
              onChange={(e) => handleInputChange("city", e.target.value)}
            />
          </div>
          <div className="field col-4">
            <label>State</label>
            <InputText
              value={step1Data.state}
              onChange={(e) => handleInputChange("state", e.target.value)}
            />
          </div>
          <div className="field col-4">
            <label>Country</label>
            <InputText
              value={step1Data.country}
              onChange={(e) => handleInputChange("country", e.target.value)}
            />
          </div>
          <div className="field col-6">
            <label>Ownership Structure</label>
            <InputText
              value={step1Data.ownershipStructure}
              onChange={(e) =>
                handleInputChange("ownershipStructure", e.target.value)
              }
            />
          </div>
          <div className="field col-6">
            <label>Is Owner Involved?</label>
            <div className="flex gap-4">
              <RadioButton
                inputId="yes"
                name="isOwnerInvolved"
                value={true}
                checked={step1Data.isOwnerInvolved === true}
                onChange={() => handleInputChange("isOwnerInvolved", true)}
              />
              <label htmlFor="yes">Yes</label>
              <RadioButton
                inputId="no"
                name="isOwnerInvolved"
                value={false}
                checked={step1Data.isOwnerInvolved === false}
                onChange={() => handleInputChange("isOwnerInvolved", false)}
              />
              <label htmlFor="no">No</label>
            </div>
          </div>
          <div className="field col-6">
            <label>Ownership % Breakdown</label>
            <InputTextarea
              value={step1Data.ownershipBreakdown}
              onChange={(e) =>
                handleInputChange("ownershipBreakdown", e.target.value)
              }
              rows={3}
            />
          </div>
          <div className="field col-6">
            <label>Facilities / Offices</label>
            <InputTextarea
              value={step1Data.facilities}
              onChange={(e) => handleInputChange("facilities", e.target.value)}
              rows={3}
            />
          </div>
          <div className="field col-4">
            <label>Number of Employees</label>
            <Dropdown
              value={step1Data.numberOfEmployees}
              options={staffOptions}
              onChange={(e) => handleInputChange("numberOfEmployees", e.value)}
              placeholder="Select"
            />
          </div>
          <div className="field col-4">
            <label>Warehouse Staff</label>
            <Dropdown
              value={step1Data.warehouseStaff}
              options={staffOptions}
              onChange={(e) => handleInputChange("warehouseStaff", e.value)}
              placeholder="Select"
            />
          </div>
          <div className="field col-4">
            <label>Administrative Staff</label>
            <Dropdown
              value={step1Data.adminStaff}
              options={staffOptions}
              onChange={(e) => handleInputChange("adminStaff", e.value)}
              placeholder="Select"
            />
          </div>
          <div className="field col-6">
            <label>General Manager</label>
            <InputText
              value={step1Data.generalManager}
              onChange={(e) =>
                handleInputChange("generalManager", e.target.value)
              }
            />
          </div>
          <div className="field col-6">
            <label>Warehouse Supervisor</label>
            <InputText
              value={step1Data.warehouseSupervisor}
              onChange={(e) =>
                handleInputChange("warehouseSupervisor", e.target.value)
              }
            />
          </div>
          <div className="field col-6">
            <label>Revenue Model</label>
            <Dropdown
              value={step1Data.revenueModel}
              options={revenueModels}
              onChange={(e) => handleInputChange("revenueModel", e.value)}
              placeholder="Select"
            />
          </div>
          <div className="field col-6">
            <label>Owner (semi-involved)</label>
            <InputText
              value={step1Data.ownerDetails}
              onChange={(e) =>
                handleInputChange("ownerDetails", e.target.value)
              }
            />
          </div>
          <div className="field col-12">
            <label>Workforce Description</label>
            <InputTextarea
              value={step1Data.workforceDescription}
              onChange={(e) =>
                handleInputChange("workforceDescription", e.target.value)
              }
              rows={2}
            />
          </div>
          <div className="field col-12">
            <label>Key Clients / Contracts</label>
            <InputTextarea
              value={step1Data.keyClients}
              onChange={(e) => handleInputChange("keyClients", e.target.value)}
              rows={2}
            />
          </div>
          <div className="field col-12">
            <label>What does your business do?</label>
            <InputTextarea
              value={step1Data.businessDescription}
              onChange={(e) =>
                handleInputChange("businessDescription", e.target.value)
              }
              rows={3}
            />
          </div>
          <div className="field col-12">
            <label>Seasonality / Trends</label>
            <InputTextarea
              value={step1Data.seasonality}
              onChange={(e) => handleInputChange("seasonality", e.target.value)}
              rows={2}
            />
          </div>
          <div className="field col-12">
            <label>Pending Legal Matters</label>
            <InputTextarea
              value={step1Data.legalMatters}
              onChange={(e) =>
                handleInputChange("legalMatters", e.target.value)
              }
              rows={2}
            />
          </div>
          <div className="field col-12">
            <label>Growth & Opportunity</label>
            <InputTextarea
              value={step1Data.growthNarrative}
              onChange={(e) =>
                handleInputChange("growthNarrative", e.target.value)
              }
              rows={3}
            />
          </div>

          <div className="col-12 flex justify-content-end mt-4">
            <Button label="Save & Continue" onClick={() => setStep(2)} />
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="p-fluid">
          <h3>Step 2: Upload Key Documents</h3>

          <div className="field">
            <label>Profit & Loss Statement</label>
            <FileUpload
              mode="basic"
              chooseLabel="Choose File"
              customUpload
              uploadHandler={(e) => handleFileUpload("profitAndLoss", e.files)}
              auto
            />
          </div>
          <div className="field">
            <label>Balance Sheet</label>
            <FileUpload
              mode="basic"
              chooseLabel="Choose File"
              customUpload
              uploadHandler={(e) => handleFileUpload("balanceSheet", e.files)}
              auto
            />
          </div>
          <div className="field">
            <label>3 Years of Tax Returns</label>
            <FileUpload
              mode="basic"
              chooseLabel="Choose File"
              customUpload
              uploadHandler={(e) => handleFileUpload("taxReturns", e.files)}
              auto
            />
          </div>
          <div className="field">
            <label>Ownership / Cap Table</label>
            <FileUpload
              mode="basic"
              chooseLabel="Choose File"
              customUpload
              uploadHandler={(e) => handleFileUpload("capTable", e.files)}
              auto
            />
          </div>

          <div className="flex justify-content-between mt-4">
            <Button label="Back" onClick={() => setStep(1)} />
            <Button
              label="Submit"
              onClick={handleSubmit}
              className="p-button-success"
            />
          </div>
        </div>
      )}
    </div>
  );
}
