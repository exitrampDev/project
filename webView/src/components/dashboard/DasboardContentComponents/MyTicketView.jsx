import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Timeline } from "primereact/timeline";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown"; 
import { useRecoilValue, useSetRecoilState } from "recoil"; // <-- Added useSetRecoilState
import { authState, apiBaseUrlState } from "../../../recoil/ctaState";
import DashboardHeader from "./DashboardHeaderBlock";

const TicketTimeline = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const API_BASE = useRecoilValue(apiBaseUrlState);
  const { access_token } = useRecoilValue(authState) ?? {};
  const setAuth = useSetRecoilState(authState); // <-- Recoil setter for handling logout

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyMessage, setReplyMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  
  // Status Update States
  const [currentStatus, setCurrentStatus] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);

  const toast = useRef(null);

  const statusOptions = [
    { label: "Opened", value: "opened" },
    { label: "Closed", value: "closed" }
  ];

  useEffect(() => {
    if (id) {
      fetchTicketData();
    }
  }, [id]);

  // Unified Centralized 403 Forbidden Handler
  const handle403Forbidden = () => {
    console.log("403 Forbidden: Access denied. Clearing auth session.");
    setAuth(null);
    localStorage.removeItem("auth");
    localStorage.removeItem("user");
    localStorage.removeItem("tokenLocalStorage");
    navigate("/login");
  };

  const fetchTicketData = async () => {
    try {
      setLoading(true);

      // 1. Fetch Ticket Messages and Ticket List in parallel
      const [messagesRes, listRes] = await Promise.all([
        fetch(`${API_BASE}/tickets/${id}/messages`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${access_token}`,
            "Content-Type": "application/json",
          },
        }),
        fetch(`${API_BASE}/tickets/my`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${access_token}`,
            "Content-Type": "application/json",
          },
        })
      ]);

      // 2. Explicitly handle 403 Forbidden status codes (since fetch doesn't throw on 403)
      if (messagesRes.status === 403 || listRes.status === 403) {
        handle403Forbidden();
        return;
      }

      // 3. Parse Messages Response if successful
      if (messagesRes.ok) {
        const messagesResult = await messagesRes.json();
        const messageList = Array.isArray(messagesResult) ? messagesResult : messagesResult?.data || [];
        setMessages(messageList);
      } else {
        throw new Error("Failed to fetch messages");
      }

      // 4. Parse Tickets List Response to look up the status
      if (listRes.ok) {
        const listResult = await listRes.json();
        const ticketList = Array.isArray(listResult) ? listResult : listResult?.data || [];
        
        const activeTicket = ticketList.find(ticket => ticket._id === id || ticket.id === id);
        if (activeTicket && activeTicket.status) {
          setCurrentStatus(activeTicket.status.toLowerCase());
        }
      } else {
        throw new Error("Failed to fetch ticket metadata");
      }

    } catch (error) {
      console.error("Error fetching ticket data", error);
      showToast("error", "Error", "Failed to load ticket details.");
    } finally {
      setLoading(false);
    }
  };

  // PATCH Request to update ticket status
  const handleStatusChange = async (newStatus) => {
    if (!newStatus) return;

    try {
      setStatusLoading(true);
      const response = await fetch(`${API_BASE}/tickets/${id}/status`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      // Handle 403 if token expires while updating status
      if (response.status === 403) {
        handle403Forbidden();
        return;
      }

      if (!response.ok) throw new Error("Failed to update status");

      setCurrentStatus(newStatus);
      showToast("success", "Status Updated", `Ticket status changed to ${newStatus}.`);
    } catch (error) {
      showToast("error", "Error", "Could not update ticket status.");
    } finally {
      setStatusLoading(false);
    }
  };

  // POST Request for Reply
  const handleSendReply = async () => {
    if (!replyMessage.trim()) {
      showToast("warn", "Empty Message", "Please type a message before sending.");
      return;
    }

    try {
      setIsSending(true);
      const response = await fetch(`${API_BASE}/tickets/user/${id}/reply`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: replyMessage }),
      });

      // Handle 403 if token expires while posting a comment
      if (response.status === 403) {
        handle403Forbidden();
        return;
      }

      if (!response.ok) throw new Error("Failed to send reply");

      showToast("success", "Sent", "Comment added successfully.");
      setReplyMessage(""); 
      fetchTicketData(); 
    } catch (error) {
      showToast("error", "Error", "Could not send reply.");
    } finally {
      setIsSending(false);
    }
  };

  const showToast = (severity, summary, detail) => {
    toast.current?.show({ severity, summary, detail, life: 3000 });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const customizedMarker = (item) => {
    const isAdmin = item.senderType?.toLowerCase() !== "user";
    return (
      <span 
        className="flex align-items-center justify-content-center text-white border-circle" 
        style={{ 
          backgroundColor: isAdmin ? "#ffb100" : "#002f68", 
          width: "2rem", height: "2rem", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center"
        }}
      >
        <i className={`pi ${isAdmin ? "pi-user-edit" : "pi-ticket"}`} style={{ color: "white" }}></i>
      </span>
    );
  };

  const customizedContent = (item) => {
    const isUser = item.senderType?.toLowerCase() === "user";
    return (
      <Card 
        subTitle={
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
            {isUser ? <span style={{ color: "#002f68", fontWeight: "600" }}>You</span> :<span style={{ color: "#ffb100", fontWeight: "600" }}>Admin</span> }
            <span>{formatDate(item.createdAt)}</span>
          </div>
        }
        style={{ 
          marginBottom: "1rem", 
          borderLeft: isUser ? "4px solid #002f68" : "4px solid #ffb100",
          background: isUser ? "#ffffff" : "#f0f7ff" 
        }}
      >
        <p style={{ whiteSpace: "pre-line", margin: 0 }}>{item.message}</p>
      </Card>
    );
  };

  return (
    <div className="ticket__timeline_page">
      <Toast ref={toast} position="top-right" />
      <DashboardHeader headingData="Ticket Conversation" />

      <div className="timeline__topbar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "1rem 0", gap: "1rem", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <label htmlFor="statusDropdown" style={{ fontWeight: "600", fontSize: "0.9rem" }}>Ticket Status:</label>
          <Dropdown
            id="statusDropdown"
            value={currentStatus}
            options={statusOptions}
            onChange={(e) => handleStatusChange(e.value)}
            disabled={statusLoading || loading}
            placeholder="Select Status"
            style={{ width: "140px" }}
          />
          {statusLoading && <i className="pi pi-spin pi-spinner" style={{ color: "#6c757d" }} />}
        </div>
        <Button 
          label="All Support Tickets" 
          icon="pi pi-arrow-left" 
          onClick={() => navigate("/user/tickets")} 
        />
      </div>

      <div className="timeline__container" style={{ marginTop: "2rem", minHeight: "300px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "2rem" }}><i className="pi pi-spin pi-spinner" style={{ fontSize: '2rem' }}></i></div>
        ) : (
          <Timeline value={messages} align="alternate" marker={customizedMarker} content={customizedContent} />
        )}
      </div>

      {/* REPLY SECTION */}
      <div className="reply__section" style={{ marginTop: "3rem" }}>
        <Card title="Add a Comment">
          <div className="p-fluid">
            <InputTextarea 
              value={replyMessage} 
              onChange={(e) => setReplyMessage(e.target.value)} 
              rows={4} 
              autoResize 
              placeholder="Type your response here..."
              disabled={isSending || currentStatus === "closed"} 
            />
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1rem" }}>
              <Button 
                label="Post Reply" 
                icon="pi pi-send" 
                onClick={handleSendReply} 
                loading={isSending} 
                className="p-button-primary"
                style={{ width: "auto" }}
                disabled={currentStatus === "closed"}
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default TicketTimeline;