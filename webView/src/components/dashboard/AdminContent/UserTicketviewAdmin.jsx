import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Timeline } from "primereact/timeline";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { InputTextarea } from "primereact/inputtextarea";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { authState, apiBaseUrlState } from "../../../recoil/ctaState";
import DashboardHeaderAdmin from "./DaashboardHeaderAdmin";

const TicketTimeline = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const API_BASE = useRecoilValue(apiBaseUrlState);
  const { access_token } = useRecoilValue(authState) ?? {};
  const setAuth = useSetRecoilState(authState);

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyMessage, setReplyMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  // Status Update States
  const [currentStatus, setCurrentStatus] = useState(null);

  const toast = useRef(null);

  useEffect(() => {
    if (id) {
      fetchTicketData();
    }
  }, [id]);

  // Centralized 403 Handler for Admin Session Wipes
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
        fetch(`${API_BASE}/tickets`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${access_token}`,
            "Content-Type": "application/json",
          },
        }),
      ]);

      // 2. Intercept native fetch status codes for 403 Forbidden
      if (messagesRes.status === 403 || listRes.status === 403) {
        handle403Forbidden();
        return;
      }

      // 3. Parse Messages Response
      if (messagesRes.ok) {
        const messagesResult = await messagesRes.json();
        const messageList = Array.isArray(messagesResult)
          ? messagesResult
          : messagesResult?.data || [];
        setMessages(messageList);
      } else {
        throw new Error("Failed to fetch ticket messages");
      }

      // 4. Parse Tickets List Response to look up the status
      if (listRes.ok) {
        const listResult = await listRes.json();
        const ticketList = Array.isArray(listResult)
          ? listResult
          : listResult?.data || [];

        const activeTicket = ticketList.find(
          (ticket) => ticket._id === id || ticket.id === id
        );
        if (activeTicket && activeTicket.status) {
          setCurrentStatus(activeTicket.status.toLowerCase());
        }
      } else {
        throw new Error("Failed to fetch ticket list dashboard metadata");
      }
    } catch (error) {
      console.error("Error fetching ticket data", error);
      showToast("error", "Error", "Failed to load ticket details.");
    } finally {
      setLoading(false);
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
      const response = await fetch(`${API_BASE}/tickets/admin/${id}/reply`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: replyMessage }),
      });

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
        className={`timeline__marker ${
          isAdmin ? "timeline__marker--admin" : "timeline__marker--user"
        }`}
      >
        <i
          className={`pi ${isAdmin ? "pi-user-edit" : "pi-ticket"} timeline__marker-icon`}
        />
      </span>
    );
  };

  const customizedContent = (item) => {
    const isUser = item.senderType?.toLowerCase() === "user";
    return (
      <Card
        subTitle={
          <div className="timeline__card-header">
            <span className="timeline__sender-name">
              {item?.senderId?.first_name} {item?.senderId?.last_name}
            </span>
            <span className="timeline__date-label">{formatDate(item.createdAt)}</span>
          </div>
        }
        className={`timeline__card ${
          isUser ? "timeline__card--user" : "timeline__card--admin"
        }`}
      >
        <p className="timeline__card-text">{item.message}</p>
      </Card>
    );
  };

  return (
    <div className="ticket__timeline_page">
      <Toast ref={toast} position="top-right" />
      <DashboardHeaderAdmin headingData="Ticket Conversation" />

      {/* Top Header Bar */}
      <div className="timeline__topbar">
        <div className="timeline__status-group">
          <label className="timeline__status-label">Ticket Status:</label>
          <div
            className={`status__badge ${
              currentStatus === "opened"
                ? "status-opened"
                : currentStatus === "closed"
                ? "status-closed"
                : ""
            }`}
          >
            {currentStatus || "-"}
          </div>
        </div>
        <Button
          label="All Support Tickets"
          icon="pi pi-arrow-left"
          onClick={() => navigate("/admin/tickets")}
          className="timeline__back-btn"
        />
      </div>

      {/* Messages Feed */}
      <div className="timeline__container">
        {loading ? (
          <div className="timeline__loading-wrap">
            <i className="pi pi-spin pi-spinner timeline__loading-icon" />
          </div>
        ) : (
          <Timeline
            value={messages}
            align="alternate"
            marker={customizedMarker}
            content={customizedContent}
          />
        )}
      </div>

      {/* Reply Section */}
      <div className="reply__section">
        <Card title="Add a Comment" className="reply__card">
          <div className="p-fluid">
            <InputTextarea
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              rows={4}
              autoResize
              placeholder="Type your response here..."
              disabled={isSending || currentStatus === "closed"}
              className="reply__textarea"
            />
            <div className="reply__action-wrap">
              <Button
                label="Post Reply"
                icon="pi pi-send"
                onClick={handleSendReply}
                loading={isSending}
                className="p-button-primary reply__submit-btn"
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