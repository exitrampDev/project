import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRecoilValue } from "recoil";
import { apiBaseUrlState, authState } from "../../../recoil/ctaState";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Checkbox } from "primereact/checkbox";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import DashboardHeader from "./DashboardHeaderBlock";

const InviteTeam = () => {
  const API_BASE = useRecoilValue(apiBaseUrlState);
  const { access_token } = useRecoilValue(authState) ?? {};

  const [form, setForm] = useState({
    name: "",
    invitedEmail: "",
    businessId: "",
    role: "",
    accuisitionType: {
      viewBusinessInfo: false,
      editBusinessInfo: false,
      approveCIMAccess: false,
      viewBuyerSubmissions: false,
      uploadManageFiles: false,
      accessDocumentRoom: false,
    },
  });

  const [listings, setListings] = useState([]);
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(false);

  const roles = ["Advisor", "Staff", "External Consultant", "Other" ];

  /* ===========================
     Fetch Listings
  ============================ */
  const fetchListings = async () => {
    try {
      const res = await axios.get(`${API_BASE}/business-listing`, {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      setListings(res.data.data || []);
    } catch (err) {
      console.error("Listing error", err);
    }
  };

  /* ===========================
     Fetch Invites
  ============================ */
  const fetchInvites = async () => {
    try {
      const res = await axios.get(`${API_BASE}/invite`, {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      setInvites(res.data || []);
    } catch (err) {
      console.error("Invite error", err);
    }
  };

  useEffect(() => {
    fetchListings();
    fetchInvites();
  }, []);

  /* ===========================
     Handle Input
  ============================ */
  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const handleCheckbox = (field) => {
    setForm({
      ...form,
      accuisitionType: {
        ...form.accuisitionType,
        [field]: !form.accuisitionType[field],
      },
    });
  };

  /* ===========================
     Submit Invite
  ============================ */
  const submitInvite = async () => {
    try {
      setLoading(true);

      const payload = {
        ...form,
        accuisitionType: Object.fromEntries(
          Object.entries(form.accuisitionType).map(([key, val]) => [
            key,
            val ? "yes" : "no",
          ])
        ),
      };

      await axios.post(`${API_BASE}/invite`, payload, {
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
      });

      alert("Invite sent successfully");

      setForm({
        name: "",
        invitedEmail: "",
        businessId: "",
        role: "",
        accuisitionType: {
          viewBusinessInfo: false,
          editBusinessInfo: false,
          approveCIMAccess: false,
          viewBuyerSubmissions: false,
          uploadManageFiles: false,
          accessDocumentRoom: false,
        },
      });

      fetchInvites();
    } catch (err) {
      console.error(err);
      alert("Failed to send invite");
    } finally {
      setLoading(false);
    }
  };

  /* ===========================
     Table UI Helpers
  ============================ */
  const permissionLabels = {
  viewBusinessInfo: "View Business Info",
  editBusinessInfo: "Edit Business Info",
  approveCIMAccess: "Approve CIM Access",
  viewBuyerSubmissions: "View Buyer Submissions",
  uploadManageFiles: "Upload / Manage Files",
  accessDocumentRoom: "Access Document Room",
};

const permissionTemplate = (row) => {
  const perms = row.accuisitionType || {};

  return Object.keys(perms)
    .filter((key) => perms[key] === "yes")
    .map((key) => permissionLabels[key] || key)
    .join(" | ");
};

  const removeInvite = async (id) => {
    try {
      await axios.delete(`${API_BASE}/invite/${id}`, {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      fetchInvites();
    } catch (err) {
      alert("Failed to remove");
    }
  };

  /* ===========================
     UI
  ============================ */
  return (
    <div className="invite__team_wrapper">
      <DashboardHeader headingData="Invite Team" />

      {/* FORM */}
   <div className="main__invite-form-wrap">
   
       <div className="invite__form_grid">
        <div className="invite__form_field">
            <label>Name</label>
        <InputText
          placeholder="Full Name"
          value={form.name}
          onChange={(e) => handleChange("name", e.target.value)}
        />
        </div>
<div className="invite__form_field">
    <label>Email</label>
        <InputText
          placeholder="Email Address"
          value={form.invitedEmail}
          onChange={(e) => handleChange("invitedEmail", e.target.value)}
        />
</div>

<div className="invite__form_field">
    <label>Role</label>
        <Dropdown
          value={form.role}
          options={roles}
          placeholder="Select Role"
          onChange={(e) => handleChange("role", e.value)}
        />
</div>
<div className="invite__form_field">
    <label>Listing</label>
        <Dropdown
          value={form.businessId}
          options={listings}
          optionLabel="listingTitle"
          optionValue="_id"
          placeholder="Select Listing"
          onChange={(e) => handleChange("businessId", e.value)}
        />
    </div>
      </div>
<h3>Acquisition Type</h3>
      {/* PERMISSIONS */}
      <div className="permissions__grid">
        {Object.keys(form.accuisitionType).map((key) => (
          <div key={key} className="checkbox__item">
            <Checkbox
              checked={form.accuisitionType[key]}
              onChange={() => handleCheckbox(key)}
            />
            <label>{permissionLabels[key]}</label>
          </div>
        ))}
      </div>

      <Button
        label={loading ? "Sending..." : "Send Invite"}
        icon="pi pi-send"
        onClick={submitInvite}
      />
   </div>

      {/* TABLE */}
      <DataTable value={invites}  className="my__save_listing_wrap my__payment_history_table">
        <Column field="name" header="Name" />
        <Column field="invitedEmail" header="Email" />
        <Column field="role" header="Role" />
        <Column
          header="Listing"
            body={(row) => {
                const text = row?.businessId?.listingTitle || "";
                return text.length > 25 ? text.substring(0, 25) + "..." : text;
            }}
        />
        <Column header="Permissions" body={permissionTemplate} />
        <Column
          header="Actions"
          body={(row) => (
            <Button
              label="Remove"
              icon="pi pi-times"
              className="btn__remove_invite"
              onClick={() => removeInvite(row._id)}
            />
          )}
        />
      </DataTable>
    </div>
  );
};

export default InviteTeam;