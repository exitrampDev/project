import React, { useEffect, useState, useRef } from "react";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { Toast } from "primereact/toast";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { useRecoilValue } from "recoil";
import { authState, apiBaseUrlState } from "../../../recoil/ctaState";
import { useNavigate } from "react-router-dom";
import DashboardHeaderAdmin from "./DaashboardHeaderAdmin";

const UserTickets = () => {
  const API_BASE = useRecoilValue(apiBaseUrlState);
  const { access_token } = useRecoilValue(authState) ?? {};

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
 const navigate = useNavigate();
  const toast = useRef(null);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${API_BASE}/tickets`, {
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

 if (error.response?.status == 403) {
      console.log("403 Forbidden: Access denied while fetching listings");
        setAuth(null);
        localStorage.removeItem("auth");
        localStorage.removeItem("user");
        localStorage.removeItem("tokenLocalStorage");
        navigate("/login");
      } else {
        console.error(error);

        toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to load tickets.",
        life: 3000,
      });

    }


      
    } finally {
      setLoading(false);
    }
  };

  const getStatusSeverity = (status) => {
    switch (status?.toLowerCase()) {
      case "opened":
        return "warning";
      case "closed":
        return "success";
      case "pending":
        return "info";
      default:
        return "secondary";
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

  // Title Column: Limits text length to 6 words
  const titleBodyTemplate = (rowData) => {
    const text = rowData?.ticketTitle || "";
    const words = text.split(" ");
    return words.length > 6 ? words.slice(0, 6).join(" ") + "..." : text;
  };

  // Status Column: Displays PrimeReact Tag component
  const statusBodyTemplate = (rowData) => {
    return (
      <Tag
        value={rowData.status}
        severity={getStatusSeverity(rowData.status)}
      />
    );
  };

  // Description Column: Prevents layout breaking if descriptions are long
  const descriptionBodyTemplate = (rowData) => {
    return (
      <div style={{ maxWidth: "250px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={rowData.ticketDescription}>
        {rowData.ticketDescription || "-"}
      </div>
    );
  };

  // Action column placeholder (you can plug your action handlers here)
  const actionBodyTemplate = (rowData) => {
    return (
      <div className="action__listing_btns">
        <Button 
          icon="pi pi-eye" 
          onClick={() => navigate(`/admin/ticket/${rowData._id}`)} 
          className="view__ticket_btn"
        />
      </div>
    );
  };

  return (
    <div className="my__tickets_page">
      <Toast ref={toast} position="top-right" />

      <DashboardHeaderAdmin headingData="Users Support Tickets" />
      
      <div className="tickets__header" style={{ marginBottom: '1rem' }}>
        <span>Total Tickets: {tickets.length}</span>
      </div>

<div className="my__save_listing_wrap my__listing_table nda__request_block">
      <DataTable
        value={tickets}
        loading={loading}
        paginator
        rows={10}
        stripedRows
        emptyMessage="No tickets found."
        className="p-datatable-sm" // Optional styling class for compact UI
      >
        <Column 
          header="Ticket ID" 
          field="_id" 
          sortable 
        />
        
        <Column 
          header="Ticket Title" 
          body={titleBodyTemplate} 
          sortable 
          field="ticketTitle"
        />
        
        <Column 
          header="Description" 
          body={descriptionBodyTemplate} 
        />
        
        <Column 
          header="Status" 
          field="status" 
          body={statusBodyTemplate} 
          sortable 
        />
        
        <Column 
          header="Created At" 
          body={(rowData) => formatDate(rowData?.createdAt)} 
          sortable 
          field="createdAt"
        />
        
        <Column 
          header="Updated At" 
          body={(rowData) => formatDate(rowData?.updatedAt)} 
          sortable 
          field="updatedAt"
        />
        
        <Column 
          header="Actions" 
          body={actionBodyTemplate} 
        />
      </DataTable>

</div>
    </div>
  );
};

export default UserTickets;