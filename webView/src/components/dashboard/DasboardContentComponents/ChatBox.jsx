import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { InputTextarea } from "primereact/inputtextarea";
import { Dialog } from "primereact/dialog"; 
import { InputText } from "primereact/inputtext"; 
import { useRecoilValue, useSetRecoilState } from "recoil";
import { authState, apiBaseUrlState } from "../../../recoil/ctaState";
import DashboardHeader from "./DashboardHeaderBlock";
import { io } from "socket.io-client";

const ChatDashboard = () => {
  const navigate = useNavigate();
  const API_BASE = useRecoilValue(apiBaseUrlState);
  const authInfo = useRecoilValue(authState);
  const { access_token } = authInfo ?? {};
  const setAuth = useSetRecoilState(authState);

  const loggedInUserId = authInfo?.user?._id || authInfo?.user?.id || JSON.parse(localStorage.getItem("user"))?._id;

  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [replyMessage, setReplyMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState(null); 

  const [displayModal, setDisplayModal] = useState(false);
  const [newChatUserId, setNewChatUserId] = useState("");
  const [newInitialMessage, setNewInitialMessage] = useState("");
  const [isCreatingChat, setIsCreatingChat] = useState(false);

  const toast = useRef(null);
  const messageEndRef = useRef(null);
  const socketRef = useRef(null);
  
  // Ref to bypass React closure traps inside real-time socket events
  const activeConversationIdRef = useRef(activeConversationId);

  // Sync ref with state updates
  useEffect(() => {
    activeConversationIdRef.current = activeConversationId;
  }, [activeConversationId]);

  // Fetch initial discussions array
  useEffect(() => {
    fetchConversations();
  }, []);

  // Handle centralized socket channel infrastructure
  useEffect(() => {
    if (!access_token || !API_BASE) return;

    const socket = io(API_BASE, {
      auth: {
        token: access_token,
      },
      transports: ["websocket"],
      reconnection: true,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Socket Connected:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("Socket Disconnected");
    });

    socket.on("connect_error", (err) => {
      console.error("Socket Error:", err.message);
    });

    socket.on("joined", (data) => {
      console.log("Joined Room Context:", data);
    });

    socket.on("newMessage", () => {
      const currentActiveId = activeConversationIdRef.current;
      console.log("New message event received from server. Active ID:", currentActiveId);
      
      if (currentActiveId) {
        fetchChatHistory(currentActiveId);
      }
      fetchConversations();
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [access_token, API_BASE]);

  // Consolidated single hook managing channel switches & socket joins
  useEffect(() => {
    if (!activeConversationId) {
      setMessages([]);
      return;
    }

    fetchChatHistory(activeConversationId);

    if (socketRef.current?.connected) {
      socketRef.current.emit("joinConversation", {
        conversationId: activeConversationId,
      });
      console.log("Joined Room:", activeConversationId);
    }
  }, [activeConversationId]);

  // Auto-scroll anchor point alignment adjustment
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handle403Forbidden = () => {
    setAuth(null);
    localStorage.removeItem("auth");
    localStorage.removeItem("user");
    localStorage.removeItem("tokenLocalStorage");
    navigate("/login");
  };

  const fetchConversations = async () => {
    try {
      setLoadingConversations(true);
      const res = await fetch(`${API_BASE}/conversation/my-conversations`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
      });

      if (res.status === 403) { handle403Forbidden(); return; }
      if (!res.ok) throw new Error("Failed to load conversation history list.");

      const result = await res.json();
      const list = Array.isArray(result) ? result : result?.data || [];
      setConversations(list);
    } catch (error) {
      console.error(error);
      showToast("error", "Error", "Could not populate conversations active pane.");
    } finally {
      setLoadingConversations(false);
    }
  };

  const fetchChatHistory = async (conversationId) => {
    try {
      setLoadingHistory(true);
      const res = await fetch(`${API_BASE}/conversation/${conversationId}/history`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
      });

      if (res.status === 403) { handle403Forbidden(); return; }
      if (!res.ok) throw new Error("Could not parse conversation timeline logs.");

      const result = await res.json();
      const historyList = Array.isArray(result) ? result : result?.data || [];
      setMessages(historyList);
    } catch (error) {
      console.error(error);
      showToast("error", "Error", "Failed loading chat transcript.");
    } finally {
      setLoadingHistory(false);
    }
  };

 const handleSendMessage = async () => {
  const text = replyMessage.trim();
  if (!text || !activeConversationId) return;

  const socket = socketRef.current;
  if (!socket?.connected) {
    showToast("error", "Connection Error", "Socket is disconnected. Cannot send message.");
    return;
  }

  try {
    setIsSending(true);
    console.log("Emitting message to conversation:", activeConversationId);
    
    // 1. Fire the payload over your WebSocket lane
    socket.emit("sendMessage", {
      conversationId: activeConversationId,
      text: text,
    });

    // 2. Optimistically append the message to your local state instantly 
    // so the user sees it without waiting for a database round-trip
    const optimisticMessage = {
      _id: `temp-${Date.now()}`, // Temporary fallback ID
      message: text,
      createdAt: new Date().toISOString(),
      senderId: [
        {
          _id: loggedInUserId,
          first_name: authInfo?.user?.first_name || "Me",
          last_name: authInfo?.user?.last_name || "",
          user_type: authInfo?.user?.user_type || "user"
        }
      ],
      senderType: "user",
      isOuterSender: false // Ensures your 'isMe' alignment logic captures it perfectly
    };

    setMessages((prevMessages) => [...prevMessages, optimisticMessage]);

    // 3. Clear out your input field
    setReplyMessage("");

    // Optional: If your backend needs a quick sync call to ensure order alignment:
    // await fetchChatHistory(activeConversationId);
    
  } catch (err) {
    console.error("Failed to process local timeline submission append:", err);
    showToast("error", "Error", "Failed to register sent dispatch trace item.");
  } finally {
    setIsSending(false);
  }
};

  const handleStartNewChat = async () => {
    if (!newChatUserId.trim() || !newInitialMessage.trim()) {
      showToast("warn", "Missing Fields", "Please populate all matching forms input segments.");
      return;
    }

    try {
      setIsCreatingChat(true);
      const res = await fetch(`${API_BASE}/conversation/send`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          toUserId: newChatUserId.trim(),
          message: newInitialMessage.trim(),
        }),
      });

      if (res.status === 403) { handle403Forbidden(); return; }
      if (!res.ok) throw new Error("Could not initialize conversation pipeline channel.");

      const responseData = await res.json();
      const createdConversationId = responseData?.conversationId || responseData?.data?.conversationId || responseData?.data?._id;

      showToast("success", "Success", "Chat connection established successfully!");
      
      setNewChatUserId("");
      setNewInitialMessage("");
      setDisplayModal(false);

      await fetchConversations();
      
      if (createdConversationId) {
        setActiveConversationId(createdConversationId);
      }
    } catch (error) {
      showToast("error", "Initialization Error", "Failed to clear target stream initialization rules setup.");
    } finally {
      setIsCreatingChat(false);
    }
  };

  const showToast = (severity, summary, detail) => {
    toast.current?.show({ severity, summary, detail, life: 3000 });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  };

  const renderModalFooter = () => {
    return (
      <div className="modal-footer-container">
        <Button label="Cancel" className="footer-chat-cancel-btn" onClick={() => setDisplayModal(false)} disabled={isCreatingChat} />
        <Button icon="pi pi-send" className="footer-chat-start-btn" onClick={handleStartNewChat} loading={isCreatingChat} />
      </div>
    );
  };

  return (
    <div className="chat-dashboard-wrapper">
      <Toast ref={toast} position="top-right" />
      <DashboardHeader headingData="Messaging Center" />

      <div className="chat-layout">
        
        {/* LEFT COLUMN: Sidebar */}
        <div className="chat-sidebar">
          <div className="sidebar-header">
            <span className="sidebar-title">Active Discussions</span>
            <Button icon="pi pi-plus" className="p-button-sm footer-chat-start-btn" onClick={() => setDisplayModal(true)} />
          </div>

          <div className="conversations-list">
            {loadingConversations ? (
              <div className="loader-container">
                <i className="pi pi-spin pi-spinner loader-icon"></i>
              </div>
            ) : conversations.length === 0 ? (
              <div className="empty-conversations">No active chats found.</div>
            ) : (
              [...conversations]
                .sort((a, b) => {
                  const dateA = new Date(a.updatedAt || a.createdAt || 0);
                  const dateB = new Date(b.updatedAt || b.createdAt || 0);
                  return dateB - dateA;
                })
                .map((chat) => {
                  const chatId = chat._id || chat.id || chat.conversationId;
                  const isSelected = chatId === activeConversationId;

                  let otherParticipant = chat.participants?.find((p) => p._id !== loggedInUserId);
                  if (!otherParticipant && chat.participants?.length > 1) {
                    otherParticipant = chat.participants[1];
                  } else if (!otherParticipant && chat.participants?.length === 1) {
                    otherParticipant = chat.participants[0];
                  }

                  const participantName = otherParticipant?.first_name 
                    ? `${otherParticipant.first_name} ${otherParticipant.last_name || ""}`.trim() 
                    : `User ...${chatId?.slice(-6)}`;
                  
                  const displayMessageText = chat.lastMessage || chat.message || "Open discussion thread...";

                  return (
                    <div
                      key={chatId}
                      onClick={() => {
                        setActiveConversationId(chatId);
                        console.log("Selected Conversation ID changed to:", chatId);
                      }}
                      className={`conversation-item ${isSelected ? 'selected' : ''}`}
                    >
                      <div className="conversation-meta">
                        <span className="participant-name">{participantName}</span>
                        <span className="timestamp">{formatDate(chat.updatedAt || chat.createdAt)}</span>
                      </div>
                      <p className="last-message">{displayMessageText}</p>
                    </div>
                  );
                })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Chat Workspace */}
        <div className="chat-workspace">
          {activeConversationId ? (
            <>
              <div className="chat-history-area">
                {loadingHistory ? (
                  <div className="loader-container central">
                    <i className="pi pi-spin pi-spinner loader-icon large"></i>
                  </div>
                ) : (
                  messages.map((msg, idx) => {
                    const sender = msg.senderId?.[0];
                    const isMe = msg.senderId === loggedInUserId || 
                                (Array.isArray(msg.senderId) && sender?._id === loggedInUserId) ||
                                msg.senderType?.toLowerCase() === "user" || 
                                msg.isOuterSender === false;

                    const isAdmin = sender?.user_type === "admin";

                    return (
                      <div 
                        key={msg._id || msg.id || idx} 
                        className={`message-row ${isMe ? 'me-align' : 'them-align'} ${isAdmin ? 'admin-row' : ''}`}
                      >
                        <div className={`message-bubble ${isMe ? 'me-bubble' : 'them-bubble'} ${isAdmin ? 'admin-bubble' : ''}`}>
                          <span className={`message-sender ${isMe ? 'me-sender' : 'them-sender'} ${isAdmin ? 'admin-sender' : ''}`}>
                            {isAdmin ? "Admin" : sender?.first_name 
                              ? `${sender.first_name} ${sender.last_name || ""}`.trim() 
                              : `User ...${sender?._id?.slice(-6)}`}
                          </span>
                          <p className="message-text">{msg.message}</p>
                          <div className={`message-timestamp ${isMe ? 'me-time' : 'them-time'}`}>
                            {formatDate(msg.createdAt)}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messageEndRef} />
              </div>

              <div className="chat-input-bar">
                <div className="input-flex-container">
                  <InputTextarea
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    rows={2}
                    autoResize
                    placeholder="Type your message here..."
                    disabled={isSending}
                    className="reply-textarea"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <Button icon="pi pi-send" onClick={handleSendMessage} loading={isSending} disabled={!replyMessage.trim()} className="input-send-btn" />
                </div>
              </div>
            </>
          ) : (
            <div className="chat-placeholder">
              <i className="pi pi-comments placeholder-icon"></i>
              <p className="placeholder-text">Select a discussion or click the "+" icon to start a new chat workspace layout window pane view.</p>
            </div>
          )}
        </div>

      </div>

      {/* POPUP MODAL */}
      <Dialog 
        header="Start a New Conversation" 
        visible={displayModal} 
        style={{ width: '450px' }} 
        modal 
        footer={renderModalFooter()} 
        onHide={() => setDisplayModal(false)}
      >
        <div className="p-fluid modal-body-layout">
          <div className="field">
            <label htmlFor="recipientId" className="modal-label">Recipient User ID</label>
            <InputText id="recipientId" value={newChatUserId} onChange={(e) => setNewChatUserId(e.target.value)} placeholder="Enter context target user identification string..." disabled={isCreatingChat} />
          </div>
          <div className="field">
            <label htmlFor="initialMessage" className="modal-label">Initial Message</label>
            <InputTextarea id="initialMessage" value={newInitialMessage} onChange={(e) => setNewInitialMessage(e.target.value)} rows={4} autoResize placeholder="Type context greetings string text to begin..." disabled={isCreatingChat} />
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default ChatDashboard;