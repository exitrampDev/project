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
import { Dropdown } from "primereact/dropdown";
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
// --- DROPDOWN & INVITE STATES ---
  const [invites, setInvites] = useState([]);
  const [loadingInvites, setLoadingInvites] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  // --- NDA USER STATES ---
const [ndaSubmissions, setNdaSubmissions] = useState([]);
const [loadingNdaUsers, setLoadingNdaUsers] = useState(false);
const [selectedNdaUser, setSelectedNdaUser] = useState(null);
  const activeConversationIdRef = useRef(activeConversationId);
  const userTypeCheck = authInfo?.user?.user_type;
  useEffect(() => {
    activeConversationIdRef.current = activeConversationId;
  }, [activeConversationId]);

  useEffect(() => {
    fetchConversations();
  }, []);

useEffect(() => {
  if (!displayModal) return;

  fetchInvites();

  if (
    authInfo?.user?.user_type === "seller_broker" ||
    authInfo?.user?.user_type === "buyer_basic"
  ) {
    fetchNdaSubmissions();
  }
}, [displayModal]);


useEffect(() => {
    if (!access_token || !API_BASE) return;

    const socket = io(API_BASE, {
      auth: { token: access_token },
      transports: ["websocket"],
      reconnection: true,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Socket Connected:", socket.id);
      
      // --- BACKUP JOIN ALL ACTIVE ROOMS ON DELAYED CONNECT ---
      if (conversations.length > 0) {
        conversations.forEach((chat) => {
          const chatId = chat._id || chat.id || chat.conversationId;
          if (chatId) {
            socket.emit("joinConversation", { conversationId: chatId });
          }
        });
        console.log("Re-joined all active background conversation rooms.");
      }
    });

    socket.on("disconnect", () => console.log("Socket Disconnected"));
    socket.on("connect_error", (err) => console.error("Socket Error:", err.message));
    socket.on("joined", (data) => console.log("Joined Room Context:", data));

    socket.on("newMessage", (payload) => {
      const currentActiveId = activeConversationIdRef.current;
      const incomingChatId = payload.conversationId || payload.conversation?._id;

      if (currentActiveId && incomingChatId === currentActiveId) {
        fetchChatHistory(currentActiveId);
      } else if (incomingChatId) {
        // This will now trigger reliably for background chats 
        // because you've joined all conversation channels!
        setUnreadCounts((prev) => ({
          ...prev,
          [incomingChatId]: (prev[incomingChatId] || 0) + 1,
        }));
      }

      setConversations((prevConversations) => {
        const existingChatIndex = prevConversations.findIndex(
          (chat) => (chat._id || chat.id || chat.conversationId) === incomingChatId
        );

        if (existingChatIndex > -1) {
          const updatedConversations = [...prevConversations];
          updatedConversations[existingChatIndex] = {
            ...updatedConversations[existingChatIndex],
            lastMessage: payload.message || payload.text,
            updatedAt: new Date().toISOString(),
          };
          return updatedConversations;
        } else {
          fetchConversations();
          return prevConversations;
        }
      });
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [access_token, API_BASE, conversations.length]); // added conversations.length safely here

  useEffect(() => {
    if (!activeConversationId) {
      setMessages([]);
      return;
    }

    fetchChatHistory(activeConversationId);

    if (socketRef.current?.connected) {
      console.log(`[Socket] Emitting joinConversation for room: ${activeConversationId}`);
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

      // --- JOIN ALL ROOMS ON FETCH ---
      list.forEach((chat) => {
        const chatId = chat._id || chat.id || chat.conversationId;
        if (chatId) {
          fetchUnreadCount(chatId);
          
          // Emit a join event for every conversation room in the list
          if (socketRef.current?.connected) {
            socketRef.current.emit("joinConversation", { conversationId: chatId });
            console.log("Background Room Joined:", chatId);
          }
        }
      });
    } catch (error) {
      console.error(error);
      showToast("error", "Error", "Could not populate conversations active pane.");
    } finally {
      setLoadingConversations(false);
    }
  };
// --- FETCH INVITED MEMBERS DATA ---
const fetchInvites = async () => {
  try {
    setLoadingInvites(true);
    
    // 1. Declare 'res' outside the blocks so it's accessible to the rest of the function
    let res = null; 
    const userType = authInfo?.user?.user_type;

    // 2. Use an if-else chain to determine the URL
    if (userType === "seller_broker") {
      res = await fetch(`${API_BASE}/invite`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
      });
    } else if (userType === "buyer_basic") {
      res = await fetch(`${API_BASE}/invite/received`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
      });
    } 
    
    else if (userType === "invited_member") {
      res = await fetch(`${API_BASE}/invite/received`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
      });
    } 
    
    
    else {
      // 3. Handle the edge case where user_type is missing or doesn't match
      throw new Error("Invalid or missing user type.");
    }
    
    // 4. Safely check if 'res' exists before accessing properties
    if (res && res.status === 403) { 
      handle403Forbidden(); 
      return; 
    }
    
    if (!res || !res.ok) throw new Error("Failed to load invitations.");

    const result = await res.json();
    setInvites(Array.isArray(result) ? result : result?.data || []);
  } catch (error) {
    console.error(error);
    showToast("error", "Error", "Could not load invited members list.");
  } finally {
    setLoadingInvites(false);
  }
};
// --- FETCH NDA OWNER SUBMISSIONS ---
const fetchNdaSubmissions = async () => {
  try {
    setLoadingNdaUsers(true);

    const userType = authInfo?.user?.user_type;

    let endpoint = "";

    if (userType === "seller_broker") {
      endpoint = `${API_BASE}/nda/owner-submissions`;
    } else if (userType === "buyer_basic") {
      endpoint = `${API_BASE}/nda`;
    } else {
      return;
    }

    const res = await fetch(endpoint, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
      },
    });

    if (res.status === 403) {
      handle403Forbidden();
      return;
    }

    if (!res.ok) throw new Error("Failed to load NDA submissions.");

    const result = await res.json();
    setNdaSubmissions(Array.isArray(result) ? result : result?.data || []);
  } catch (error) {
    console.error(error);
    showToast("error", "Error", "Could not load NDA users.");
  } finally {
    setLoadingNdaUsers(false);
  }
  console.log("Fetched NDA Submissions:", ndaSubmissions);
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
const handleViewDocument = (e, fileData) => {
  if (!fileData) return;

  // If it's a standard web URL link, let the default navigation handle it
  if (fileData.startsWith('http://') || fileData.startsWith('https://')) {
    return;
  }

  // If it's a base64 string data URI, bypass the browser's about:blank block
  if (fileData.startsWith('data:')) {
    e.preventDefault(); // Stop default anchor navigation
    
    try {
      const parts = fileData.split(';base64,');
      const contentType = parts[0].split(':')[1];
      const raw = window.atob(parts[1]);
      const rawLength = raw.length;
      const uInt8Array = new Uint8Array(rawLength);

      for (let i = 0; i < rawLength; ++i) {
        uInt8Array[i] = raw.charCodeAt(i);
      }

      const blob = new Blob([uInt8Array], { type: contentType });
      const blobUrl = URL.createObjectURL(blob);
      
      // Open the clean, browser-safe local Blob URL safely
      window.open(blobUrl, '_blank');
    } catch (error) {
      console.error("Failed to parse base64 document template payload:", error);
    }
  }
};
const handleStartNewChat = async () => {
  const recipientUserId = selectedNdaUser || selectedMember;
  const message = newInitialMessage.trim();

  if (!recipientUserId || !message) {
    showToast(
      "warn",
      "Missing Fields",
      "Please select an invited member or NDA user and type a message."
    );
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
        toUserId: recipientUserId,
        message,
      }),
    });

    if (res.status === 403) {
      handle403Forbidden();
      return;
    }

    const responseData = await res.json().catch(() => null);

    if (!res.ok) {
      throw new Error(
        responseData?.message ||
        "Could not initialize the conversation."
      );
    }

    const createdConversationId =
      responseData?.conversationId ||
      responseData?.data?.conversationId ||
      responseData?.data?._id ||
      responseData?._id;

    showToast(
      "success",
      "Success",
      "Conversation started successfully."
    );

    setNewInitialMessage("");
    setSelectedBusiness(null);
    setSelectedMember(null);
    setSelectedNdaUser(null);
    setDisplayModal(false);

    await fetchConversations();

    if (createdConversationId) {
      setActiveConversationId(createdConversationId);
    }
  } catch (error) {
    console.error("Start conversation error:", error);

    showToast(
      "error",
      "Conversation Error",
      error.message || "Failed to start the conversation."
    );
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
      // console.log(`Unread count for conversation ${conversationId}:`, count);
    } catch (err) {
      console.error("Unread count error", err);
    }
  };
  // --- GENERATING DROPDOWN OPTIONS ---
  // Get unique list of businesses from the invitations payload
  const businessOptions = Array.from(
    new Map(
      invites
        .filter((inv) => inv.businessId)
        .map((inv) => [inv.businessId._id, { label: inv.businessId.listingTitle, value: inv.businessId._id }])
    ).values()
  );
const markUnreadCount = async (childId) => {
    if (!childId || !API_BASE || !access_token) return;

    try {
      console.log("Marking message as read for conversation/message ID:", childId);
      
      const res = await fetch(`${API_BASE}/conversation/message-read-by/${childId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
      });

      if (res.status === 403) { 
        handle403Forbidden(); 
        return; 
      }

      if (!res.ok) throw new Error("Failed to update read status on the server.");

      // Optional: Update your local unread badge state immediately upon success
      setUnreadCounts((prev) => ({ ...prev, [childId]: 0 }));
      
    } catch (err) {
      console.error("Error in markUnreadCount:", err);
    }
  };

  const filteredMemberOptions = invites.map((inv) => {
  const userType = authInfo?.user?.user_type;
  
  // 1. Determine which user object we are dealing with based on the role
  let targetUser = null;
  if (userType === "seller_broker") {
    targetUser = inv.invitedUserId;
  } else if (userType === "buyer_basic") {
    targetUser = inv.invitedByUserId;
  } else if (userType === "invited_member") {
    targetUser = inv.invitedByUserId;
  }

  // 2. Build the email suffix dynamically
  const emailSuffix = targetUser?.email ? ` ${targetUser.email}` : "";

  return {
    label: `${emailSuffix} | ${inv.businessId.listingTitle || '-'}`,
    value: targetUser?._id, 
  };
});

// --- GENERATE UNIQUE NDA USER OPTIONS ---
const ndaUserOptions = ndaSubmissions
  .map((submission) => {
    const userType = authInfo?.user?.user_type;

    if (userType === "seller_broker") {
      const buyer = submission?.buyer;

      const buyerId =
        buyer?._id ||
        submission?.submittedBy?._id ||
        submission?.submittedBy;

      if (!buyerId) return null;

      const buyerName =
        `${buyer?.first_name || ""} ${buyer?.last_name || ""}`.trim() ||
        submission?.buyerName ||
        submission?.submittedByEmail ||
        "NDA Buyer";

      return {
        label: `${buyerName} | ${
          submission?.listingTitle || "Untitled listing"
        } | ${submission?.ndaStatus || "Unknown"}`,
        value: buyerId,
      };
    }

    if (userType === "buyer_basic") {
      const sellerId =
        submission?.ownerId ||
        submission?._id ||
        submission?.sellerId ||
        submission?.ownerId;

      if (!sellerId) return null;

      const sellerName =
        `${submission?.buyerName || ""}`.trim() ||
        submission?.sellerName ||
        submission?.ownerName ||
        "Listing Seller";

      return {
        label: ` ${
          submission?.listingTitle || "Untitled listing"
        } | ${submission?.ndaStatus || "Unknown"}`,
        value: sellerId,
      };
    }

    return null;
  })
  .filter(Boolean);
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
                // .sort((a, b) => {
                //   const dateA = new Date(a.updatedAt || a.createdAt || 0);
                //   const dateB = new Date(b.updatedAt || b.createdAt || 0);
                //   return dateB - dateA;
                // })
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
                        markUnreadCount(chat._id)
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
                    
                    // Unified file data checker targeting back-end schema varieties
                    const fileData = msg.file || msg.base64 || msg.attachment?.url || msg.attachment?.base64;
                    const isImage = fileData?.startsWith("data:image/") || /\.(jpeg|jpg|gif|png|webp)$/i.test(fileData || "");

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
                          {fileData && (
                            <div className="message-attachment-container" style={{ marginTop: '8px' }}>
                              {isImage ? (
                                <img 
                                  src={fileData} 
                                  alt={msg.name || "Attachment"} 
                                  style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '4px', display: 'block' }} 
                                />
                              ) : (
                                <a 
                                  href={fileData} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  onClick={(e) => handleViewDocument(e, fileData)}
                                  style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '6px', 
                                    textDecoration: 'underline', 
                                    cursor: 'pointer',
                                    color: typeof isMe !== 'undefined' && isMe ? '#fff' : '#007ad9' 
                                  }}
                                >
                                  <i className="pi pi-file"></i>
                                  <span>View Document</span> 
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
                    className="input-attach-btn" 
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
  style={{ width: "650px" }}
  modal
  footer={renderModalFooter()}
  onHide={() => {
    setDisplayModal(false);
    setSelectedBusiness(null);
    setSelectedMember(null);
    setSelectedNdaUser(null);
    setNewInitialMessage("");
  }}
>
  <div className="p-fluid modal-body-layout">
    <div className="field">
      <label htmlFor="memberSelect" className="modal-label">
        {authInfo?.user?.user_type === "seller_broker"
          ? "Select Invitee"
          : authInfo?.user?.user_type === "buyer_basic"
            ? "Select Inviter"
            : "Select User"}
      </label>

     <Dropdown
  id="memberSelect"
  value={selectedMember}
  options={filteredMemberOptions}
  onChange={(e) => {
    setSelectedMember(e.value);

    if (e.value) {
      setSelectedNdaUser(null);
    }
  }}
  placeholder={
    loadingInvites
      ? "Loading invited users..."
      : "Choose an invited user..."
  }
  loading={loadingInvites}
  disabled={
    loadingInvites ||
    isCreatingChat ||
    !!selectedNdaUser
  }
  filter
  showClear
  emptyMessage="No invited users found"
/>
    </div>

    {["seller_broker", "buyer_basic"].includes(
  authInfo?.user?.user_type
) && (
      <div className="field">
        <label htmlFor="ndaUserSelect" className="modal-label">
          Select NDA User
        </label>
<Dropdown
  id="ndaUserSelect"
  value={selectedNdaUser}
  options={ndaUserOptions}
  onChange={(e) => {
    setSelectedNdaUser(e.value);

    if (e.value) {
      setSelectedMember(null);
    }
  }}
  placeholder={
    loadingNdaUsers
      ? "Loading NDA users..."
      : "Choose an NDA user..."
  }
  loading={loadingNdaUsers}
  disabled={
    loadingNdaUsers ||
    isCreatingChat ||
    !!selectedMember
  }
  filter
  showClear
  emptyMessage="No NDA users found"
/>
      </div>
    )}

    <div className="field">
      <label htmlFor="initialMessage" className="modal-label">
        Initial Message
      </label>

      <InputTextarea
        id="initialMessage"
        value={newInitialMessage}
        onChange={(e) => setNewInitialMessage(e.target.value)}
        rows={4}
        autoResize
        placeholder="Type your initial message..."
        disabled={isCreatingChat}
      />
    </div>
  </div>
</Dialog>
    </div>
  );
};

export default ChatDashboard;