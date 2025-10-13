import React, { useEffect, useState, useRef } from "react";
import { Toast } from "primereact/toast";
import axios from "axios";
import { useRecoilValue } from "recoil";
import { authState,apiBaseUrlState } from "../../../recoil/ctaState";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import notifInfo from "../../../assets/notifInfo.png";
import serachIcon from "../../../assets/serachIcon.png";
import userImg from "../../../assets/userImg.png";

const FreeBuyerForm = () => {
  const { access_token } = useRecoilValue(authState) ?? {};
  const API_BASE = useRecoilValue(apiBaseUrlState);
  const user = useRecoilValue(authState).user;
  const toast = useRef(null);
  const [dirty, setDirty] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    investmentBudget: "",
    industryOfInterest: "",
    regionOfInterest: "",
    businessTypePreferrd: "",
    howSoonLookinToAcquire: "",
    liquidAssetToSupporPurchase: "",
    financingIsPlaced: "",
    previousAcquisitionExperience: "",
    howDoYouPlanToFundYourPurchase: "",
    verificationOfFinancialQualification: "",
    briefBackground: "",
    willingToSignNDAsDigitally: "",
  });

  const [existingId, setExistingId] = useState(null); // will store record _id if exists
  const [loading, setLoading] = useState(true);

  const yesNoOptions = [
    { label: "Yes", value: "yes" },
    { label: "No", value: "no" },
  ];

  const ndaOptions = [
    { label: "Yes", value: "true" },
    { label: "No", value: "false" },
  ];

  // Fetch API data
  useEffect(() => {
    if (!access_token) return;

    axios
      .get(`${API_BASE}/free-buyer/public`, {
        headers: { Authorization: `Bearer ${access_token}` },
      })
      .then((res) => {
        if (res.data) {
          if (res.data._id) {
            // single object
            setExistingId(res.data._id);
            setFormData(res.data);
          } else if (Array.isArray(res.data) && res.data.length > 0) {
            // array
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (existingId) {
        // PATCH update
        await axios.patch(
          `${API_BASE}/free-buyer/${existingId}`,
          formData,
          {
            headers: { Authorization: `Bearer ${access_token}` },
          }
        );
        toast.current.show({
          severity: "success",
          summary: "Success",
          detail: "Data updated successfully!",
          life: 3000,
        });
        setDirty(false);
      } else {
        // POST create
        const res = await axios.post(
          `${API_BASE}/free-buyer`,
          formData,
          {
            headers: { Authorization: `Bearer ${access_token}` },
          }
        );
        setExistingId(res.data._id);
        toast.current.show({
          severity: "success",
          summary: "Success",
          detail: "Data created successfully!",
          life: 3000,
        });
        setDirty(false);
      }
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

  return (
    <>
      <Toast ref={toast} />
      <div className="dashboard__header_block">
        <h3 className="heading__Digital_CIM">Complete Your Buyer Profile</h3>

        <div className="dashboard__header_search_notification_wrap">
          <div className="dashboard__search_field_wrap">
            <input type="text" placeholder="Search" />
            <img src={serachIcon} alt="search" />
          </div>
          <div className="dashboard__notification_wrap">
            <button>
              <img src={notifInfo} alt="notifications" />
            </button>
          </div>
          <div className="dashboard__user_wrap">
            <button>
              <img src={userImg} alt="user" />
            </button>
          </div>
        </div>
      </div>
      <div className="brief__infor_content">
        Provide additional details to help sellers assess your fit. A complete
        profile increases your chances of NDA approval and unlocks advanced deal
        access.
      </div>

      <div className="complete_buyer_form_wrap">
        {" "}
        <form onSubmit={handleSubmit} className="form_wrap">
          {/* Contact Info */}
          <div className="field form__field_col">
            <label>Email</label>
            <div className="form__field_col_hardocded_email">{user?.email}</div>
          </div>
          {/* Name */}
          <div className="field form__field_col">
            <label>First Name</label>
            <InputText
              value={formData.firstName || ""}
              onChange={(e) => handleChange("firstName", e.target.value)}
            />
          </div>

          <div className="field form__field_col">
            <label>Last Name</label>
            <InputText
              value={formData.lastName || ""}
              onChange={(e) => handleChange("lastName", e.target.value)}
            />
          </div>

          <div className="field form__field_col">
            <label>Phone</label>
            <InputText
              value={formData.phone || ""}
              onChange={(e) => handleChange("phone", e.target.value)}
            />
          </div>

          {/* Financial & Business Info */}
          <div className="field form__field_col">
            <label>Investment Budget</label>
            <InputText
              value={formData.investmentBudget || ""}
              onChange={(e) => handleChange("investmentBudget", e.target.value)}
            />
          </div>

          <div className="field form__field_col">
            <label>Industry of Interest</label>
            <InputText
              value={formData.industryOfInterest || ""}
              onChange={(e) =>
                handleChange("industryOfInterest", e.target.value)
              }
            />
          </div>

          <div className="field form__field_col">
            <label>Region of Interest</label>
            <InputText
              value={formData.regionOfInterest || ""}
              onChange={(e) => handleChange("regionOfInterest", e.target.value)}
            />
          </div>

          <div className="field form__field_col">
            <label>Business Type Preferred</label>
            <InputText
              value={formData.businessTypePreferrd || ""}
              onChange={(e) =>
                handleChange("businessTypePreferrd", e.target.value)
              }
            />
          </div>

          <div className="field form__field_col">
            <label>How Soon Looking to Acquire</label>
            <InputText
              value={formData.howSoonLookinToAcquire || ""}
              onChange={(e) =>
                handleChange("howSoonLookinToAcquire", e.target.value)
              }
            />
          </div>

          <div className="field form__field_col">
            <label>Liquid Assets to Support Purchase</label>
            <InputText
              value={formData.liquidAssetToSupporPurchase || ""}
              onChange={(e) =>
                handleChange("liquidAssetToSupporPurchase", e.target.value)
              }
            />
          </div>

          {/* Yes/No Dropdowns */}
          <div className="field form__field_col">
            <label>Financing is Placed</label>
            <Dropdown
              value={formData.financingIsPlaced || ""}
              options={yesNoOptions}
              onChange={(e) => handleChange("financingIsPlaced", e.value)}
              placeholder="Select"
            />
          </div>

          <div className="field form__field_col">
            <label>Previous Acquisition Experience</label>
            <Dropdown
              value={formData.previousAcquisitionExperience || ""}
              options={yesNoOptions}
              onChange={(e) =>
                handleChange("previousAcquisitionExperience", e.value)
              }
              placeholder="Select"
            />
          </div>

          <div className="field plan_purchase_field">
            <label>How Do You Plan to Fund Your Purchase?</label>
            <InputText
              value={formData.howDoYouPlanToFundYourPurchase || ""}
              onChange={(e) =>
                handleChange("howDoYouPlanToFundYourPurchase", e.target.value)
              }
            />
          </div>

          <div className="field form__field_col_verifications">
            <label>
              Do you Have a Verification of Financial Qualification?
            </label>
            <InputText
              value={formData.verificationOfFinancialQualification || ""}
              onChange={(e) =>
                handleChange(
                  "verificationOfFinancialQualification",
                  e.target.value
                )
              }
            />
          </div>

          {/* Background */}
          <div className="field brief_bg_wrap">
            <label>Brief Background</label>
            <InputTextarea
              rows={3}
              autoResize
              value={formData.briefBackground || ""}
              onChange={(e) => handleChange("briefBackground", e.target.value)}
            />
          </div>

          <div className="submit__btn_block">
            <div className="field form__field_col">
              <label>Willing to Sign NDAs Digitally</label>
              <Dropdown
                value={formData.willingToSignNDAsDigitally || ""}
                options={ndaOptions}
                onChange={(e) =>
                  handleChange("willingToSignNDAsDigitally", e.value)
                }
                placeholder="Select"
              />
            </div>

            {/* Submit Button */}
            <div className="col-12 flex justify-content-end mt-3">
              <Button label="Save Profile" type="submit" disabled={!dirty} />
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default FreeBuyerForm;
