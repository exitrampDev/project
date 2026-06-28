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
  const [unreadCounts, setUnreadCounts] = useState({});
  const loggedInUserId = authInfo?.user?._id || authInfo?.user?.id || JSON.parse(localStorage.getItem("user"))?._id;

  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [replyMessage, setReplyMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState(null); 

  // --- ATTACHMENT STATE ---
  const [attachment, setAttachment] = useState(null); // stores { name, type, base64 }

  const [displayModal, setDisplayModal] = useState(false);
  const [newChatUserId, setNewChatUserId] = useState("");
  const [newInitialMessage, setNewInitialMessage] = useState("");
  const [isCreatingChat, setIsCreatingChat] = useState(false);

  const toast = useRef(null);
  const messageEndRef = useRef(null);
  const socketRef = useRef(null);
  const fileInputRef = useRef(null);
  
  const activeConversationIdRef = useRef(activeConversationId);

  useEffect(() => {
    activeConversationIdRef.current = activeConversationId;
  }, [activeConversationId]);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (!access_token || !API_BASE) return;

    const socket = io(API_BASE, {
      auth: { token: access_token },
      transports: ["websocket"],
      reconnection: true,
    });

    socketRef.current = socket;

    socket.on("connect", () => console.log("Socket Connected:", socket.id));
    socket.on("disconnect", () => console.log("Socket Disconnected"));
    socket.on("connect_error", (err) => console.error("Socket Error:", err.message));
    socket.on("joined", (data) => console.log("Joined Room Context:", data));

    socket.on("newMessage", (payload) => {
      const currentActiveId = activeConversationIdRef.current;
      if (currentActiveId) {
        fetchChatHistory(currentActiveId);
      }
      fetchConversations();
      conversations.forEach((chat) => {
        const chatId = chat._id || chat.id || chat.conversationId;
        if (chatId) fetchUnreadCount(chatId);
      });
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [access_token, API_BASE]);

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
      list.forEach((chat) => {
        const chatId = chat._id || chat.id || chat.conversationId;
        if (chatId) fetchUnreadCount(chatId);
      });
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

  // --- HANDLE FILE CONVERSION TO BASE64 ---
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setAttachment({
        name: file.name,
        type: file.type,
        base64: reader.result, // Contains metadata prefix (e.g., data:image/png;base64,...)
      });
    };
    reader.readAsDataURL(file);
  };

  const removeAttachment = () => {
    setAttachment(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

 const handleSendMessage = async () => {
  const text = replyMessage.trim();
  // Allow sending if there's either text OR an attachment present
  if ((!text && !attachment) || !activeConversationId) return;

  const socket = socketRef.current;
  if (!socket?.connected) {
    showToast("error", "Connection Error", "Socket is disconnected. Cannot send message.");
    return;
  }

  try {
    setIsSending(true);
    
    // --- EXACT MATCH FOR YOUR BACKEND SCHEMATIC PAYLOAD ---
    const payload = {
      conversationId: activeConversationId,
      text: text, // Sends plain text if typing
      message: text, // Standard fallback
      file: attachment ? attachment.base64 : null // Root placement mapping your exact payload
    };

    // 1. Emit payload over WebSocket
    socket.emit("sendMessage", payload);

    // 2. Optimistic local update matching backend historical format
    const optimisticMessage = {
      _id: `temp-${Date.now()}`,
      message: text,
      file: attachment ? attachment.base64 : null, // Mirroring backend database storage field
      createdAt: new Date().toISOString(),
      senderId: {
        _id: loggedInUserId,
        first_name: authInfo?.user?.first_name || "Me",
        last_name: authInfo?.user?.last_name || "",
        user_type: authInfo?.user?.user_type || "user"
      },
      senderType: "user",
      isOuterSender: false
    };

    setMessages((prevMessages) => [...prevMessages, optimisticMessage]);

    // 3. Reset UI inputs
    setReplyMessage("");
    removeAttachment();
    
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

  const fetchUnreadCount = async (conversationId) => {
    try {
      const res = await fetch(`${API_BASE}/conversation/unread-count/${conversationId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) return;
      const result = await res.json();
      // const count = result?.count ?? result?.data?.count ?? result?.unreadCount ?? 0;
      const count = result ?? 0;
      setUnreadCounts((prev) => ({ ...prev, [conversationId]: count }));
      console.log(`Unread count for conversation ${conversationId}:`, count);
    } catch (err) {
      console.error("Unread count error", err);
    }
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
                        setUnreadCounts((prev) => ({ ...prev, [chatId]: 0 }));
                      }}
                      className={`conversation-item ${isSelected ? 'selected' : ''}`}
                    >
                      <div className="conversation-meta">
                        <div className="conversation-user-section">
                          <span className="participant-name">{participantName}</span>
                          {unreadCounts[chatId] > 0 && (
                            <span className="unread-badge">{unreadCounts[chatId]}</span>
                          )}
                        </div>
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
                    const sender = msg.senderId;
                    const isMe = sender?._id === loggedInUserId || 
                                 (Array.isArray(msg.senderId) && sender?._id === loggedInUserId) ||
                                 msg.senderType?.toLowerCase() === "user" || 
                                 msg.isOuterSender === false;
                    const isAdmin = sender?.user_type === "admin";
                    
                    // Destructure attachment payload properties depending on back-end response models
                    const msgAttachment = msg.attachment || msg.file;

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
                          
                          {/* Text Rendering Context */}
                          {msg.message && <p className="message-text">{msg.message}</p>}

                          {/* Dynamic Attachment Rendering Handler */}
                          {msgAttachment && (
                            <div className="message-attachment-container" style={{ marginTop: '8px' }}>
                              {msgAttachment.type?.startsWith("image/") ? (
                                <img 
                                  src={msgAttachment.url || msgAttachment.base64} 
                                  alt={msgAttachment.name || "Attachment"} 
                                  style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '4px', display: 'block' }} 
                                />
                              ) : (
                                <a 
                                  href={msgAttachment.url || msgAttachment.base64} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  style={{ display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'underline', color: isMe ? '#fff' : '#007ad9' }}
                                >
                                  <i className="pi pi-file"></i>
                                  <span>{msgAttachment.name || "View Document"}</span>
                                </a>
                              )}
                            </div>
                          )}

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

              {/* CHAT INPUT BAR WITH ATTACHMENTS */}
              <div className="chat-input-bar">
                {/* Visual preview of staging attachment before emitting payload */}
                {attachment && (
                  <div className="attachment-preview-bar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 12px', background: '#f4f4f4', borderBottom: '1px solid #ddd', borderRadius: '4px 4px 0 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <i className={attachment.type.startsWith("image/") ? "pi pi-image" : "pi pi-file-pdf"}></i>
                      <span style={{ fontSize: '0.9rem', maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {attachment.name}
                      </span>
                    </div>
                    <Button icon="pi pi-times" className="p-button-rounded p-button-text p-button-danger p-button-sm" onClick={removeAttachment} />
                  </div>
                )}

                <div className="input-flex-container">
                  {/* Hidden browser input handling file selection */}
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    style={{ display: 'none' }} 
                    accept="image/*,application/pdf,application/*"
                    onChange={handleFileChange} 
                  />
                  
                  <Button 
                    icon="pi pi-paperclip" 
                    type="button"
                    className="p-button-text input-attach-btn" 
                    onClick={() => fileInputRef.current?.click()} 
                    disabled={isSending}
                  />

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
                  <Button 
                    icon="pi pi-send" 
                    onClick={handleSendMessage} 
                    loading={isSending} 
                    disabled={!replyMessage.trim() && !attachment} 
                    className="input-send-btn" 
                  />
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