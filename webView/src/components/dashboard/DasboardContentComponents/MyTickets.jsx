import React, { useEffect, useState, useRef } from "react";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { Toast } from "primereact/toast";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { useRecoilValue } from "recoil";
import { useNavigate } from "react-router-dom"; // 1. IMPORT THENAVIGATE HOOK
import { authState, apiBaseUrlState } from "../../../recoil/ctaState";
import DashboardHeader from "./DashboardHeaderBlock";

const MyTickets = () => {
  const API_BASE = useRecoilValue(apiBaseUrlState);
  const { access_token } = useRecoilValue(authState) ?? {};
  
  const navigate = useNavigate(); // 2. INITIALIZE THE NAVIGATE FUNCTION

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [displayModal, setDisplayModal] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [formData, setFormData] = useState({
    ticketTitle: "",
    ticketDescription: ""
  });

  const toast = useRef(null);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${API_BASE}/tickets/my`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch tickets");
      }

      const result = await response.json();
      setTickets(result?.data || []);
    } catch (error) {
      console.error(error);
      showToast("error", "Error", "Failed to load tickets.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    
    if (!formData.ticketTitle.trim() || !formData.ticketDescription.trim()) {
      showToast("warn", "Validation Error", "Please fill in all fields.");
      return;
    }

    try {
      setSubmitLoading(true);

      const response = await fetch(`${API_BASE}/tickets/create`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to create ticket");
      }

      showToast("success", "Success", "Ticket created successfully.");
      
      setFormData({ ticketTitle: "", ticketDescription: "" });
      setDisplayModal(false);
      
      fetchTickets();
    } catch (error) {
      console.error(error);
      showToast("error", "Error", "Failed to submit ticket.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const showToast = (severity, summary, detail) => {
    toast.current?.show({ severity, summary, detail, life: 3000 });
  };

  const getStatusSeverity = (status) => {
    switch (status?.toLowerCase()) {
      case "opened": return "warning";
      case "closed": return "success";
      case "pending": return "info";
      default: return "secondary";
    }
  };

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  // --- COLUMN TEMPLATES ---

  const titleBodyTemplate = (rowData) => {
    const text = rowData?.ticketTitle || "";
    const words = text.split(" ");
    return words.length > 6 ? words.slice(0, 6).join(" ") + "..." : text;
  };

  const statusBodyTemplate = (rowData) => {
    return <Tag value={rowData.status} severity={getStatusSeverity(rowData.status)} />;
  };

  const descriptionBodyTemplate = (rowData) => {
    return (
      <div style={{ maxWidth: "250px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={rowData.ticketDescription}>
        {rowData.ticketDescription || "-"}
      </div>
    );
  };

  const actionBodyTemplate = (rowData) => {
    return (
      <div className="action__listing_btns">
        <Button 
          icon="pi pi-eye" 
          onClick={() => navigate(`/user/ticket/${rowData._id}`)} 
          className="view__ticket_btn"
        />
      </div>
    );
  };

  const renderModalFooter = () => {
    return (
      <div>
        <Button label="Cancel" icon="pi pi-times" className="p-button-text" onClick={() => setDisplayModal(false)} disabled={submitLoading} />
        <Button label="Submit" icon="pi pi-check" onClick={handleCreateTicket} loading={submitLoading} autoFocus />
      </div>
    );
  };

  return (
    <div className="my__tickets_page">
      <Toast ref={toast} position="top-right" />

      <DashboardHeader headingData="My Support Tickets" />
      
      <div className="tickets__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '1rem 0' }}>
        <span>Total Tickets: {tickets.length}</span>
        <span> 
          <Button 
            label="Create Ticket" 
            icon="pi pi-plus" 
            className="p-button-outlined" 
            onClick={() => setDisplayModal(true)} 
          />
        </span>
      </div>

      <div className="my__save_listing_wrap my__listing_table nda__request_block">
        <DataTable
          value={tickets}
          loading={loading}
          paginator
          rows={10}
          stripedRows
          emptyMessage="No tickets found."
          className="p-datatable-sm"
        >
          <Column header="Ticket ID" field="_id" sortable />
          <Column header="Ticket Title" body={titleBodyTemplate} sortable field="ticketTitle" />
          <Column header="Description" body={descriptionBodyTemplate} />
          <Column header="Status" field="status" body={statusBodyTemplate} sortable />
          <Column header="Created At" body={(rowData) => formatDate(rowData?.createdAt)} sortable field="createdAt" />
          <Column header="Updated At" body={(rowData) => formatDate(rowData?.updatedAt)} sortable field="updatedAt" />
          <Column header="Actions" body={actionBodyTemplate} />
        </DataTable>
      </div>

      {/* CREATE TICKET MODAL DIALOG */}
      <Dialog 
        header="Create Support Ticket" 
        visible={displayModal} 
        style={{ width: '450px' }} 
        footer={renderModalFooter()} 
        onHide={() => setDisplayModal(false)}
      >
        <div className="p-fluid" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingTop: '0.5rem' }}>
          <div className="field">
            <label htmlFor="ticketTitle" style={{ fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>Ticket Title</label>
            <InputText 
              id="ticketTitle" 
              value={formData.ticketTitle} 
              onChange={(e) => setFormData({ ...formData, ticketTitle: e.target.value })} 
              placeholder="e.g., Unable to login into mobile app"
              disabled={submitLoading}
            />
          </div>
          
          <div className="field">
            <label htmlFor="ticketDescription" style={{ fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>Ticket Description</label>
            <InputTextarea 
              id="ticketDescription" 
              value={formData.ticketDescription} 
              onChange={(e) => setFormData({ ...formData, ticketDescription: e.target.value })} 
              rows={5} 
              autoResize 
              placeholder="Provide context about your issue..."
              disabled={submitLoading}
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default MyTickets;