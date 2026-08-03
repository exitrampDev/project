import React, {
  useEffect,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { InputTextarea } from "primereact/inputtextarea";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import {
  useRecoilValue,
  useSetRecoilState,
} from "recoil";
import {
  authState,
  apiBaseUrlState,
} from "../../../recoil/ctaState";
import DashboardHeaderAdmin from "./DaashboardHeaderAdmin";
import { io } from "socket.io-client";

const ChatDashboardAdmin = () => {
  const navigate = useNavigate();

  const API_BASE = useRecoilValue(apiBaseUrlState);
  const authInfo = useRecoilValue(authState);
  const setAuth = useSetRecoilState(authState);

  const { access_token } = authInfo ?? {};

  const storedUser = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  const loggedInUserId =
    authInfo?.user?._id ||
    authInfo?.user?.id ||
    storedUser?._id ||
    storedUser?.id;

  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({});

  const [loadingConversations, setLoadingConversations] =
    useState(true);
  const [loadingHistory, setLoadingHistory] =
    useState(false);

  const [activeConversationId, setActiveConversationId] =
    useState(null);

  const [replyMessage, setReplyMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const [availableUsers, setAvailableUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const [attachment, setAttachment] = useState(null);

  const [displayModal, setDisplayModal] = useState(false);
  const [newChatUserId, setNewChatUserId] = useState("");
  const [newInitialMessage, setNewInitialMessage] =
    useState("");
  const [isCreatingChat, setIsCreatingChat] =
    useState(false);

  const toast = useRef(null);
  const messageEndRef = useRef(null);
  const socketRef = useRef(null);
  const fileInputRef = useRef(null);

  /*
   * These refs allow socket listeners to always access the
   * latest active conversation and conversation list.
   */
  const activeConversationIdRef = useRef(
    activeConversationId
  );

  const conversationsRef = useRef(conversations);

  useEffect(() => {
    activeConversationIdRef.current =
      activeConversationId;
  }, [activeConversationId]);

  useEffect(() => {
    conversationsRef.current = conversations;
  }, [conversations]);

  const showToast = (
    severity,
    summary,
    detail
  ) => {
    toast.current?.show({
      severity,
      summary,
      detail,
      life: 3000,
    });
  };

  const handle403Forbidden = () => {
    setAuth(null);

    localStorage.removeItem("auth");
    localStorage.removeItem("user");
    localStorage.removeItem("tokenLocalStorage");

    navigate("/login");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";

    return new Date(dateString).toLocaleTimeString(
      "en-US",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  const getChatId = (chat) =>
    chat?._id ||
    chat?.id ||
    chat?.conversationId;

  const getOtherParticipant = (chat) => {
    if (!chat?.participants?.length) {
      return null;
    }

    const otherParticipant =
      chat.participants.find(
        (participant) =>
          participant?._id !== loggedInUserId &&
          participant?.id !== loggedInUserId
      );

    return (
      otherParticipant ||
      chat.participants[0]
    );
  };

  const getParticipantName = (chat) => {
    const participant = getOtherParticipant(chat);
    const chatId = getChatId(chat);

    if (participant?.first_name) {
      return `${participant.first_name} ${
        participant.last_name || ""
      }`.trim();
    }

    if (participant?.name) {
      return participant.name;
    }

    if (participant?.email) {
      return participant.email;
    }

    return `User ...${chatId?.slice(-6) || ""}`;
  };

  const fetchUnreadCount = async (
    conversationId
  ) => {
    if (
      !conversationId ||
      !API_BASE ||
      !access_token
    ) {
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE}/conversation/unread-count/${conversationId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${access_token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 403) {
        handle403Forbidden();
        return;
      }

      if (!response.ok) return;

      const result = await response.json();

      /*
       * Keep compatibility with either a direct numeric
       * response or an object response.
       */
      const count =
        typeof result === "number"
          ? result
          : result?.count ??
            result?.data?.count ??
            result?.unreadCount ??
            0;

      setUnreadCounts((previousCounts) => ({
        ...previousCounts,
        [conversationId]: count,
      }));
    } catch (error) {
      console.error(
        "Unread count error:",
        error
      );
    }
  };

  const joinConversationRoom = (
    conversationId
  ) => {
    if (
      !conversationId ||
      !socketRef.current?.connected
    ) {
      return;
    }

    socketRef.current.emit(
      "joinConversation",
      {
        conversationId,
      }
    );
  };

  const joinAllConversationRooms = (
    conversationList = []
  ) => {
    if (!socketRef.current?.connected) {
      return;
    }

    conversationList.forEach((chat) => {
      const chatId = getChatId(chat);

      if (chatId) {
        socketRef.current.emit(
          "joinConversation",
          {
            conversationId: chatId,
          }
        );
      }
    });
  };

  const fetchConversations = async () => {
    if (!API_BASE || !access_token) {
      return;
    }

    try {
      setLoadingConversations(true);

      const response = await fetch(
        `${API_BASE}/conversation/all-conversations`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${access_token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 403) {
        handle403Forbidden();
        return;
      }

      if (!response.ok) {
        throw new Error(
          "Failed to load conversation history."
        );
      }

      const result = await response.json();

      const list = Array.isArray(result)
        ? result
        : result?.data || [];

      setConversations(list);
      conversationsRef.current = list;

      /*
       * Load initial unread badge values from the API.
       */
      list.forEach((chat) => {
        const chatId = getChatId(chat);

        if (chatId) {
          fetchUnreadCount(chatId);
        }
      });

      /*
       * Join every room immediately when the socket
       * is already connected.
       */
      joinAllConversationRooms(list);
    } catch (error) {
      console.error(
        "Conversation list error:",
        error
      );

      showToast(
        "error",
        "Error",
        "Could not load conversations."
      );
    } finally {
      setLoadingConversations(false);
    }
  };

  const fetchChatHistory = async (
    conversationId
  ) => {
    if (
      !conversationId ||
      !API_BASE ||
      !access_token
    ) {
      return;
    }

    try {
      setLoadingHistory(true);

      const response = await fetch(
        `${API_BASE}/conversation/${conversationId}/history`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${access_token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 403) {
        handle403Forbidden();
        return;
      }

      if (!response.ok) {
        throw new Error(
          "Could not load conversation history."
        );
      }

      const result = await response.json();

      const historyList = Array.isArray(result)
        ? result
        : result?.data || [];

      setMessages(historyList);
    } catch (error) {
      console.error(
        "Chat history error:",
        error
      );

      showToast(
        "error",
        "Error",
        "Failed to load the conversation."
      );
    } finally {
      setLoadingHistory(false);
    }
  };

  const fetchAvailableUsers = async () => {
    if (!API_BASE || !access_token) {
      return;
    }

    try {
      setLoadingUsers(true);

      const response = await fetch(
        `${API_BASE}/users`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${access_token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 403) {
        handle403Forbidden();
        return;
      }

      if (!response.ok) {
        throw new Error(
          "Failed to load users."
        );
      }

      const result = await response.json();

      const userList = Array.isArray(result)
        ? result
        : result?.data || [];

      const formattedUsers = userList.map(
        (user) => ({
          label:
            user.name ||
            `${user.first_name || ""} ${
              user.last_name || ""
            }`.trim() ||
            user.email ||
            user._id ||
            user.id,
          value: user._id || user.id,
        })
      );

      setAvailableUsers(formattedUsers);
    } catch (error) {
      console.error(
        "Users list error:",
        error
      );

      showToast(
        "error",
        "Error",
        "Could not load the users list."
      );
    } finally {
      setLoadingUsers(false);
    }
  };

  const markUnreadCount = async (
    conversationId
  ) => {
    if (
      !conversationId ||
      !API_BASE ||
      !access_token
    ) {
      return;
    }

    /*
     * Clear the badge immediately in the frontend.
     */
    setUnreadCounts((previousCounts) => ({
      ...previousCounts,
      [conversationId]: 0,
    }));

    try {
      const response = await fetch(
        `${API_BASE}/conversation/message-read-by/${conversationId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${access_token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 403) {
        handle403Forbidden();
        return;
      }

      if (!response.ok) {
        throw new Error(
          "Failed to mark conversation as read."
        );
      }
    } catch (error) {
      console.error(
        "Mark conversation read error:",
        error
      );

      /*
       * Synchronize again if the server update fails.
       */
      fetchUnreadCount(conversationId);
    }
  };

  /*
   * Fetch initial conversations.
   */
  useEffect(() => {
    if (!API_BASE || !access_token) {
      return;
    }

    fetchConversations();
  }, [API_BASE, access_token]);

  /*
   * Load users when the new-conversation modal opens.
   */
  useEffect(() => {
    if (displayModal) {
      fetchAvailableUsers();
    }
  }, [displayModal]);

  /*
   * Socket connection and unread badge handling.
   */
  useEffect(() => {
    if (!access_token || !API_BASE) {
      return;
    }

    const socket = io(API_BASE, {
      auth: {
        token: access_token,
      },
      transports: ["websocket"],
      reconnection: true,
    });

    socketRef.current = socket;

    const handleSocketConnect = () => {
      console.log(
        "Admin Socket Connected:",
        socket.id
      );

      /*
       * This is essential for socket-based badges.
       * Join every room after initial connection
       * and after every socket reconnection.
       */
      conversationsRef.current.forEach(
        (chat) => {
          const chatId = getChatId(chat);

          if (chatId) {
            socket.emit(
              "joinConversation",
              {
                conversationId: chatId,
              }
            );
          }
        }
      );
    };

    const handleSocketDisconnect = () => {
      console.log(
        "Admin Socket Disconnected"
      );
    };

    const handleSocketError = (error) => {
      console.error(
        "Admin Socket Error:",
        error.message
      );
    };

    const handleRoomJoined = (data) => {
      console.log(
        "Joined Conversation Room:",
        data
      );
    };

    const handleNewMessage = (payload) => {
      const currentActiveId =
        activeConversationIdRef.current;

      const incomingChatId =
        payload?.conversationId ||
        payload?.conversation?._id;

      if (!incomingChatId) {
        return;
      }

      if (
        currentActiveId &&
        incomingChatId === currentActiveId
      ) {
        /*
         * The conversation is currently open.
         * Refresh messages without increasing its badge.
         */
        fetchChatHistory(currentActiveId);
      } else {
        /*
         * The conversation is not currently open.
         * Increase its unread badge through socket state.
         */
        setUnreadCounts(
          (previousCounts) => ({
            ...previousCounts,
            [incomingChatId]:
              Number(
                previousCounts[incomingChatId] || 0
              ) + 1,
          })
        );
      }

      /*
       * Update the conversation preview and timestamp.
       */
      setConversations(
        (previousConversations) => {
          const existingChatIndex =
            previousConversations.findIndex(
              (chat) =>
                getChatId(chat) ===
                incomingChatId
            );

          if (existingChatIndex > -1) {
            const updatedConversations = [
              ...previousConversations,
            ];

            const existingConversation =
              updatedConversations[
                existingChatIndex
              ];

            updatedConversations[
              existingChatIndex
            ] = {
              ...existingConversation,
              lastMessage:
                payload.message ||
                payload.text ||
                existingConversation.lastMessage,
              updatedAt:
                payload.createdAt ||
                new Date().toISOString(),
            };

            /*
             * Move the latest conversation to the top.
             */
            const [updatedConversation] =
              updatedConversations.splice(
                existingChatIndex,
                1
              );

            return [
              updatedConversation,
              ...updatedConversations,
            ];
          }

          /*
           * The socket message belongs to a new
           * conversation not currently in the list.
           */
          fetchConversations();

          return previousConversations;
        }
      );
    };

    socket.on(
      "connect",
      handleSocketConnect
    );

    socket.on(
      "disconnect",
      handleSocketDisconnect
    );

    socket.on(
      "connect_error",
      handleSocketError
    );

    socket.on(
      "joined",
      handleRoomJoined
    );

    socket.on(
      "newMessage",
      handleNewMessage
    );

    return () => {
      socket.off(
        "connect",
        handleSocketConnect
      );

      socket.off(
        "disconnect",
        handleSocketDisconnect
      );

      socket.off(
        "connect_error",
        handleSocketError
      );

      socket.off(
        "joined",
        handleRoomJoined
      );

      socket.off(
        "newMessage",
        handleNewMessage
      );

      socket.disconnect();
      socketRef.current = null;
    };
  }, [access_token, API_BASE]);

  /*
   * Whenever the conversation list changes, join any
   * new conversation rooms without reconnecting the socket.
   */
  useEffect(() => {
    conversationsRef.current = conversations;

    if (!socketRef.current?.connected) {
      return;
    }

    conversations.forEach((chat) => {
      const chatId = getChatId(chat);

      if (chatId) {
        socketRef.current.emit(
          "joinConversation",
          {
            conversationId: chatId,
          }
        );
      }
    });
  }, [conversations]);

  /*
   * Load selected conversation and join its room.
   */
  useEffect(() => {
    if (!activeConversationId) {
      setMessages([]);
      return;
    }

    fetchChatHistory(
      activeConversationId
    );

    joinConversationRoom(
      activeConversationId
    );
  }, [activeConversationId]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  const handleConversationSelect = (
    chatId
  ) => {
    if (!chatId) return;

    setActiveConversationId(chatId);

    setUnreadCounts(
      (previousCounts) => ({
        ...previousCounts,
        [chatId]: 0,
      })
    );

    markUnreadCount(chatId);
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = () => {
      setAttachment({
        name: file.name,
        type: file.type,
        base64: reader.result,
      });
    };

    reader.readAsDataURL(file);
  };

  const removeAttachment = () => {
    setAttachment(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSendMessage = () => {
    const text = replyMessage.trim();

    if (
      (!text && !attachment) ||
      !activeConversationId
    ) {
      return;
    }

    const socket = socketRef.current;

    if (!socket?.connected) {
      showToast(
        "error",
        "Connection Error",
        "Socket is disconnected. Cannot send the message."
      );

      return;
    }

    try {
      setIsSending(true);

      const payload = {
        conversationId:
          activeConversationId,
        text,
        message: text,
        file: attachment
          ? attachment.base64
          : null,
      };

      socket.emit(
        "sendMessage",
        payload
      );

      const optimisticMessage = {
        _id: `temp-${Date.now()}`,
        message: text,
        file: attachment
          ? attachment.base64
          : null,
        createdAt:
          new Date().toISOString(),
        senderId: {
          _id: loggedInUserId,
          first_name:
            authInfo?.user?.first_name ||
            "Admin",
          last_name:
            authInfo?.user?.last_name ||
            "",
          user_type: "admin",
        },
        senderType: "user",
        isOuterSender: false,
      };

      setMessages(
        (previousMessages) => [
          ...previousMessages,
          optimisticMessage,
        ]
      );

      setReplyMessage("");
      removeAttachment();
    } catch (error) {
      console.error(
        "Send message error:",
        error
      );

      showToast(
        "error",
        "Error",
        "Failed to send the message."
      );
    } finally {
      setIsSending(false);
    }
  };

  const handleViewDocument = (
    event,
    fileData
  ) => {
    if (!fileData) return;

    if (
      fileData.startsWith("http://") ||
      fileData.startsWith("https://")
    ) {
      return;
    }

    if (!fileData.startsWith("data:")) {
      return;
    }

    event.preventDefault();

    try {
      const parts =
        fileData.split(";base64,");

      if (parts.length !== 2) {
        throw new Error(
          "Invalid Base64 file."
        );
      }

      const contentType =
        parts[0].split(":")[1];

      const raw = window.atob(parts[1]);

      const byteArray =
        new Uint8Array(raw.length);

      for (
        let index = 0;
        index < raw.length;
        index += 1
      ) {
        byteArray[index] =
          raw.charCodeAt(index);
      }

      const blob = new Blob(
        [byteArray],
        {
          type: contentType,
        }
      );

      const blobUrl =
        URL.createObjectURL(blob);

      window.open(blobUrl, "_blank");

      window.setTimeout(() => {
        URL.revokeObjectURL(blobUrl);
      }, 60000);
    } catch (error) {
      console.error(
        "Open document error:",
        error
      );

      showToast(
        "error",
        "File Error",
        "The attached document could not be opened."
      );
    }
  };

  const handleStartNewChat = async () => {
    const initialMessage =
      newInitialMessage.trim();

    if (
      !newChatUserId ||
      !initialMessage
    ) {
      showToast(
        "warn",
        "Missing Fields",
        "Please select a recipient and type a message."
      );

      return;
    }

    try {
      setIsCreatingChat(true);

      const response = await fetch(
        `${API_BASE}/conversation/send`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            toUserId: newChatUserId,
            message: initialMessage,
          }),
        }
      );

      if (response.status === 403) {
        handle403Forbidden();
        return;
      }

      const responseData =
        await response
          .json()
          .catch(() => null);

      if (!response.ok) {
        throw new Error(
          responseData?.message ||
            "Could not start the conversation."
        );
      }

      const createdConversationId =
        responseData?.conversationId ||
        responseData?.data
          ?.conversationId ||
        responseData?.data?._id ||
        responseData?._id;

      showToast(
        "success",
        "Success",
        "Conversation started successfully."
      );

      setNewChatUserId("");
      setNewInitialMessage("");
      setDisplayModal(false);

      await fetchConversations();

      if (createdConversationId) {
        setActiveConversationId(
          createdConversationId
        );

        joinConversationRoom(
          createdConversationId
        );
      }
    } catch (error) {
      console.error(
        "Start conversation error:",
        error
      );

      showToast(
        "error",
        "Conversation Error",
        error.message ||
          "Failed to start the conversation."
      );
    } finally {
      setIsCreatingChat(false);
    }
  };

  const activeConversation =
    conversations.find(
      (chat) =>
        getChatId(chat) ===
        activeConversationId
    );

  const activeParticipantName =
    activeConversation
      ? getParticipantName(
          activeConversation
        )
      : "Conversation";

  const renderModalFooter = () => (
    <div className="modal-footer-container">
      <Button
        label="Cancel"
        type="button"
        className="footer-chat-cancel-btn"
        onClick={() =>
          setDisplayModal(false)
        }
        disabled={isCreatingChat}
      />

      <Button
        icon="pi pi-send"
        type="button"
        aria-label="Start conversation"
        className="footer-chat-start-btn"
        onClick={handleStartNewChat}
        loading={isCreatingChat}
      />
    </div>
  );

  return (
    <div className="chat-dashboard-wrapper">
      <Toast
        ref={toast}
        position="top-right"
      />

      <DashboardHeaderAdmin
        headingData="Messaging Center"
      />

      <style>{`
        .mobile-chat-header {
          display: none;
        }

        @media (max-width: 767px) {
          .chat-dashboard-wrapper {
            min-width: 0;
            overflow: hidden;
          }

          .chat-dashboard-wrapper .chat-layout {
            display: block !important;
            width: 100%;
            height: calc(100vh - 105px);
            height: calc(100dvh - 105px);
            min-height: 420px;
            overflow: hidden;
          }

          .chat-dashboard-wrapper .chat-sidebar {
            display: flex;
            flex-direction: column;
            width: 100% !important;
            max-width: none !important;
            height: 100%;
            border-right: 0;
          }

          .chat-dashboard-wrapper .sidebar-header {
            flex: 0 0 auto;
            padding: 12px 14px;
          }

          .chat-dashboard-wrapper .conversations-list {
            flex: 1 1 auto;
            min-height: 0;
            overflow-y: auto;
            -webkit-overflow-scrolling: touch;
          }

          .chat-dashboard-wrapper .conversation-item {
            padding: 14px;
            cursor: pointer;
          }

          .chat-dashboard-wrapper .conversation-meta {
            gap: 10px;
          }

          .chat-dashboard-wrapper
            .conversation-user-section {
            min-width: 0;
          }

          .chat-dashboard-wrapper
            .participant-name,
          .chat-dashboard-wrapper
            .last-message {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .chat-dashboard-wrapper .chat-workspace {
            display: none !important;
            width: 100% !important;
            height: 100%;
            min-width: 0;
            overflow: hidden;
          }

          .chat-dashboard-wrapper
            .chat-layout.mobile-chat-open
            .chat-sidebar {
            display: none;
          }

          .chat-dashboard-wrapper
            .chat-layout.mobile-chat-open
            .chat-workspace {
            display: flex !important;
            flex-direction: column;
          }

          .chat-dashboard-wrapper
            .mobile-chat-header {
            display: flex;
            flex: 0 0 auto;
            align-items: center;
            gap: 10px;
            min-height: 52px;
            padding: 8px 12px;
            background: #ffffff;
            border-bottom: 1px solid #e5e7eb;
          }

          .chat-dashboard-wrapper
            .mobile-back-button.p-button {
            flex: 0 0 40px;
            width: 40px;
            height: 40px;
            padding: 0;
          }

          .chat-dashboard-wrapper
            .mobile-chat-name {
            min-width: 0;
            overflow: hidden;
            color: #1f2937;
            font-size: 0.95rem;
            font-weight: 600;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .chat-dashboard-wrapper
            .chat-history-area {
            flex: 1 1 auto;
            min-height: 0;
            padding: 12px;
            overflow-y: auto;
            -webkit-overflow-scrolling: touch;
          }

          .chat-dashboard-wrapper .message-row {
            width: 100%;
          }

          .chat-dashboard-wrapper
            .message-bubble {
            max-width: 86%;
            overflow-wrap: anywhere;
          }

          .chat-dashboard-wrapper
            .message-attachment-container
            img {
            width: auto;
            max-width: 100% !important;
            height: auto;
          }

          .chat-dashboard-wrapper
            .chat-input-bar {
            position: static;
            flex: 0 0 auto;
            width: 100%;
            padding: 8px 10px
              calc(
                8px +
                  env(safe-area-inset-bottom)
              );
            background: #ffffff;
            border-top: 1px solid #e5e7eb;
          }

          .chat-dashboard-wrapper
            .input-flex-container {
            display: grid;
            grid-template-columns:
              42px minmax(0, 1fr) 42px;
            align-items: end;
            gap: 7px;
            width: 100%;
          }

          .chat-dashboard-wrapper
            .input-attach-btn.p-button,
          .chat-dashboard-wrapper
            .input-send-btn.p-button {
            width: 42px;
            height: 42px;
            padding: 0;
          }

          .chat-dashboard-wrapper
            .reply-textarea {
            width: 100%;
            min-width: 0;
            max-height: 112px;
            padding: 10px;
            overflow-y: auto !important;
            resize: none;
          }

          .chat-dashboard-wrapper
            .attachment-preview-bar
            span {
            max-width: 55vw !important;
          }

          .chat-start-dialog {
            width: calc(
              100vw - 24px
            ) !important;
            max-height: calc(
              100dvh - 24px
            );
            margin: 12px;
          }

          .chat-start-dialog
            .p-dialog-content {
            overflow-y: auto;
          }

          .chat-start-dialog .p-dropdown {
            width: 100%;
            min-width: 0;
          }
        }

        @media (max-width: 380px) {
          .chat-dashboard-wrapper
            .message-bubble {
            max-width: 91%;
          }

          .chat-dashboard-wrapper
            .input-flex-container {
            grid-template-columns:
              38px minmax(0, 1fr) 38px;
            gap: 5px;
          }

          .chat-dashboard-wrapper
            .input-attach-btn.p-button,
          .chat-dashboard-wrapper
            .input-send-btn.p-button {
            width: 38px;
            height: 40px;
          }
        }
      `}</style>

      <div
        className={`chat-layout ${
          activeConversationId
            ? "mobile-chat-open"
            : ""
        }`}
      >
        <div className="chat-sidebar">
          <div className="sidebar-header">
            <span className="sidebar-title">
              Active Discussions
            </span>

            <Button
              icon="pi pi-plus"
              type="button"
              aria-label="Start conversation"
              className="p-button-sm footer-chat-start-btn"
              onClick={() =>
                setDisplayModal(true)
              }
            />
          </div>

          <div className="conversations-list">
            {loadingConversations ? (
              <div className="loader-container">
                <i className="pi pi-spin pi-spinner loader-icon" />
              </div>
            ) : conversations.length === 0 ? (
              <div className="empty-conversations">
                No active chats found.
              </div>
            ) : (
              [...conversations]
                .sort((first, second) => {
                  const firstDate =
                    new Date(
                      first.updatedAt ||
                        first.createdAt ||
                        0
                    );

                  const secondDate =
                    new Date(
                      second.updatedAt ||
                        second.createdAt ||
                        0
                    );

                  return (
                    secondDate - firstDate
                  );
                })
                .map((chat) => {
                  const chatId =
                    getChatId(chat);

                  const isSelected =
                    chatId ===
                    activeConversationId;

                  const participantName =
                    getParticipantName(chat);

                  const displayMessageText =
                    chat.lastMessage ||
                    chat.message ||
                    "Open discussion thread...";

                  const unreadCount =
                    Number(
                      unreadCounts[chatId] ||
                        0
                    );

                  return (
                    <div
                      key={chatId}
                      role="button"
                      tabIndex={0}
                      className={`conversation-item ${
                        isSelected
                          ? "selected"
                          : ""
                      }`}
                      onClick={() =>
                        handleConversationSelect(
                          chatId
                        )
                      }
                      onKeyDown={(event) => {
                        if (
                          event.key ===
                            "Enter" ||
                          event.key === " "
                        ) {
                          event.preventDefault();

                          handleConversationSelect(
                            chatId
                          );
                        }
                      }}
                    >
                      <div className="conversation-meta">
                        <div className="conversation-user-section">
                          <span className="participant-name">
                            {
                              participantName
                            }
                          </span>

                          {unreadCount > 0 && (
                            <span className="unread-badge">
                              {unreadCount}
                            </span>
                          )}
                        </div>

                        <span className="timestamp">
                          {formatDate(
                            chat.updatedAt ||
                              chat.createdAt
                          )}
                        </span>
                      </div>

                      <p className="last-message">
                        {
                          displayMessageText
                        }
                      </p>
                    </div>
                  );
                })
            )}
          </div>
        </div>

        <div className="chat-workspace">
          {activeConversationId ? (
            <>
              <div className="mobile-chat-header">
                <Button
                  icon="pi pi-arrow-left"
                  type="button"
                  className="p-button-rounded p-button-text mobile-back-button"
                  aria-label="Back to conversations"
                  onClick={() =>
                    setActiveConversationId(
                      null
                    )
                  }
                />

                <span className="mobile-chat-name">
                  {activeParticipantName}
                </span>
              </div>

              <div className="chat-history-area">
                {loadingHistory ? (
                  <div className="loader-container central">
                    <i className="pi pi-spin pi-spinner loader-icon large" />
                  </div>
                ) : (
                  messages.map(
                    (
                      messageItem,
                      index
                    ) => {
                      const sender =
                        messageItem.senderId;

                      const normalizedSender =
                        Array.isArray(sender)
                          ? sender[0]
                          : sender;

                      const isMe =
                        normalizedSender?._id ===
                          loggedInUserId ||
                        normalizedSender?.id ===
                          loggedInUserId ||
                        messageItem
                          .isOuterSender ===
                          false;

                      const isAdmin =
                        normalizedSender
                          ?.user_type ===
                          "admin";

                      const fileData =
                        messageItem.file ||
                        messageItem.base64 ||
                        messageItem
                          .attachment?.url ||
                        messageItem
                          .attachment?.base64;

                      const isImage =
                        fileData?.startsWith(
                          "data:image/"
                        ) ||
                        /\.(jpeg|jpg|gif|png|webp)$/i.test(
                          fileData || ""
                        );

                      return (
                        <div
                          key={
                            messageItem._id ||
                            messageItem.id ||
                            index
                          }
                          className={`message-row ${
                            isMe
                              ? "me-align"
                              : "them-align"
                          } ${
                            isAdmin
                              ? "admin-row"
                              : ""
                          }`}
                        >
                          <div
                            className={`message-bubble ${
                              isMe
                                ? "me-bubble"
                                : "them-bubble"
                            } ${
                              isAdmin
                                ? "admin-bubble"
                                : ""
                            }`}
                          >
                            <span
                              className={`message-sender ${
                                isMe
                                  ? "me-sender"
                                  : "them-sender"
                              } ${
                                isAdmin
                                  ? "admin-sender"
                                  : ""
                              }`}
                            >
                              {isAdmin
                                ? "Admin"
                                : normalizedSender
                                      ?.first_name
                                  ? `${
                                      normalizedSender.first_name
                                    } ${
                                      normalizedSender.last_name ||
                                      ""
                                    }`.trim()
                                  : `User ...${
                                      normalizedSender?._id?.slice(
                                        -6
                                      ) || ""
                                    }`}
                            </span>

                            {messageItem.message && (
                              <p className="message-text">
                                {
                                  messageItem.message
                                }
                              </p>
                            )}

                            {fileData && (
                              <div
                                className="message-attachment-container"
                                style={{
                                  marginTop:
                                    "8px",
                                }}
                              >
                                {isImage ? (
                                  <img
                                    src={
                                      fileData
                                    }
                                    alt={
                                      messageItem.name ||
                                      "Attachment"
                                    }
                                    style={{
                                      maxWidth:
                                        "100%",
                                      maxHeight:
                                        "200px",
                                      borderRadius:
                                        "4px",
                                      display:
                                        "block",
                                    }}
                                  />
                                ) : (
                                  <a
                                    href={
                                      fileData
                                    }
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(
                                      event
                                    ) =>
                                      handleViewDocument(
                                        event,
                                        fileData
                                      )
                                    }
                                    style={{
                                      display:
                                        "flex",
                                      alignItems:
                                        "center",
                                      gap: "6px",
                                      textDecoration:
                                        "underline",
                                      cursor:
                                        "pointer",
                                      color: isMe
                                        ? "#ffffff"
                                        : "#007ad9",
                                    }}
                                  >
                                    <i className="pi pi-file" />

                                    <span>
                                      View
                                      Document
                                    </span>
                                  </a>
                                )}
                              </div>
                            )}

                            <div
                              className={`message-timestamp ${
                                isMe
                                  ? "me-time"
                                  : "them-time"
                              }`}
                            >
                              {formatDate(
                                messageItem.createdAt
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    }
                  )
                )}

                <div ref={messageEndRef} />
              </div>

              <div className="chat-input-bar">
                {attachment && (
                  <div
                    className="attachment-preview-bar"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent:
                        "space-between",
                      padding: "6px 12px",
                      background: "#f4f4f4",
                      borderBottom:
                        "1px solid #dddddd",
                      borderRadius:
                        "4px 4px 0 0",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        minWidth: 0,
                        gap: "8px",
                      }}
                    >
                      <i
                        className={
                          attachment.type.startsWith(
                            "image/"
                          )
                            ? "pi pi-image"
                            : "pi pi-file-pdf"
                        }
                      />

                      <span
                        style={{
                          fontSize:
                            "0.9rem",
                          maxWidth:
                            "250px",
                          overflow:
                            "hidden",
                          textOverflow:
                            "ellipsis",
                          whiteSpace:
                            "nowrap",
                        }}
                      >
                        {
                          attachment.name
                        }
                      </span>
                    </div>

                    <Button
                      icon="pi pi-times"
                      type="button"
                      aria-label="Remove attachment"
                      className="p-button-rounded p-button-text p-button-danger p-button-sm"
                      onClick={
                        removeAttachment
                      }
                    />
                  </div>
                )}

                <div className="input-flex-container">
                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{
                      display: "none",
                    }}
                    accept="image/*,application/pdf,application/*"
                    onChange={
                      handleFileChange
                    }
                  />

                  <Button
                    icon="pi pi-paperclip"
                    type="button"
                    aria-label="Attach file"
                    className="input-attach-btn"
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                    disabled={isSending}
                  />

                  <InputTextarea
                    value={replyMessage}
                    onChange={(event) =>
                      setReplyMessage(
                        event.target.value
                      )
                    }
                    rows={2}
                    autoResize
                    placeholder="Type your message here..."
                    disabled={isSending}
                    className="reply-textarea"
                    onKeyDown={(event) => {
                      if (
                        event.key ===
                          "Enter" &&
                        !event.shiftKey
                      ) {
                        event.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />

                  <Button
                    icon="pi pi-send"
                    type="button"
                    aria-label="Send message"
                    onClick={
                      handleSendMessage
                    }
                    loading={isSending}
                    disabled={
                      !replyMessage.trim() &&
                      !attachment
                    }
                    className="input-send-btn"
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="chat-placeholder">
              <i className="pi pi-comments placeholder-icon" />

              <p className="placeholder-text">
                Select a discussion or click
                the “+” icon to start a new
                conversation.
              </p>
            </div>
          )}
        </div>
      </div>

      <Dialog
        header="Start a New Conversation"
        visible={displayModal}
        style={{
          width: "450px",
        }}
        className="chat-start-dialog"
        breakpoints={{
          "767px":
            "calc(100vw - 24px)",
        }}
        modal
        footer={renderModalFooter()}
        onHide={() => {
          setDisplayModal(false);
          setNewChatUserId("");
          setNewInitialMessage("");
        }}
      >
        <div className="p-fluid modal-body-layout">
          <div
            className="field"
            style={{
              marginBottom: "1rem",
            }}
          >
            <label
              htmlFor="recipientId"
              className="modal-label"
              style={{
                display: "block",
                marginBottom: "0.5rem",
              }}
            >
              Recipient User
            </label>

            <Dropdown
              id="recipientId"
              value={newChatUserId}
              options={availableUsers}
              onChange={(event) =>
                setNewChatUserId(
                  event.value
                )
              }
              placeholder={
                loadingUsers
                  ? "Loading user list..."
                  : "Select a user to begin..."
              }
              disabled={
                isCreatingChat ||
                loadingUsers
              }
              filter
              showClear
              emptyMessage="No users found"
            />
          </div>

          <div className="field">
            <label
              htmlFor="initialMessage"
              className="modal-label"
              style={{
                display: "block",
                marginBottom: "0.5rem",
              }}
            >
              Initial Message
            </label>

            <InputTextarea
              id="initialMessage"
              value={newInitialMessage}
              onChange={(event) =>
                setNewInitialMessage(
                  event.target.value
                )
              }
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

export default ChatDashboardAdmin;