import React, { useEffect, useState, useRef } from "react";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { Toast } from "primereact/toast";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { authState, apiBaseUrlState } from "../../../recoil/ctaState";
import { useNavigate } from "react-router-dom";
import DashboardHeaderAdmin from "./DaashboardHeaderAdmin";
import ResponsiveDataTable from "../../customcomponent/ResponsiveDataTable";

const UserTickets = () => {
  const API_BASE = useRecoilValue(apiBaseUrlState);
  const { access_token } = useRecoilValue(authState) ?? {};
  const setAuth = useSetRecoilState(authState);

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

      if (response.status === 403) {
        console.log("403 Forbidden: Access denied while fetching tickets");
        setAuth(null);
        localStorage.removeItem("auth");
        localStorage.removeItem("user");
        localStorage.removeItem("tokenLocalStorage");
        navigate("/login");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch tickets");
      }

      const result = await response.json();
      setTickets(result?.data || []);
    } catch (error) {
      console.error(error);

      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to load tickets.",
        life: 3000,
      });
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

  /* ===========================
     Column Body Templates
  ============================ */
  const titleBodyTemplate = (rowData) => {
    const text = rowData?.ticketTitle || "";
    const words = text.split(" ");
    return words.length > 6 ? words.slice(0, 6).join(" ") + "..." : text;
  };

  const statusBodyTemplate = (rowData) => {
    return (
      <Tag
        value={rowData.status}
        severity={getStatusSeverity(rowData.status)}
      />
    );
  };

  const descriptionBodyTemplate = (rowData) => {
    return (
      <div
        style={{
          maxWidth: "250px",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
        title={rowData.ticketDescription}
      >
        {rowData.ticketDescription || "-"}
      </div>
    );
  };

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

  /* ===========================
     Table Columns Configuration
  ============================ */
  const ticketColumns = [
    {
      field: "_id",
      header: "Ticket ID",
      sortable: true,
    },
    {
      field: "ticketTitle",
      header: "Ticket Title",
      primary: true, // Used as main header title in mobile card view
      sortable: true,
      body: titleBodyTemplate,
    },
    {
      field: "ticketDescription",
      header: "Description",
      body: descriptionBodyTemplate,
    },
    {
      field: "status",
      header: "Status",
      sortable: true,
      body: statusBodyTemplate,
    },
    {
      field: "createdAt",
      header: "Created At",
      sortable: true,
      body: (rowData) => formatDate(rowData?.createdAt),
    },
    {
      field: "updatedAt",
      header: "Updated At",
      sortable: true,
      body: (rowData) => formatDate(rowData?.updatedAt),
    },
    {
      field: "actions",
      header: "Actions",
      body: actionBodyTemplate,
    },
  ];

  return (
    <div className="my__tickets_page">
      <Toast ref={toast} position="top-right" />

      <DashboardHeaderAdmin headingData="Users Support Tickets" />

      <div className="tickets__header" style={{ marginBottom: "1rem" }}>
        <span>Total Tickets: {tickets.length}</span>
      </div>

      {/* Responsive Table Wrapper */}
      <div className="my__save_listing_wrap my__listing_table nda__request_block">
        <ResponsiveDataTable
          value={tickets}
          columns={ticketColumns}
          loading={loading}
          paginator
          rows={10}
          dataKey="_id"
          emptyMessage="No tickets found."
          cardBreakpoint="768px"
        />
      </div>
    </div>
  );
};

export default UserTickets;