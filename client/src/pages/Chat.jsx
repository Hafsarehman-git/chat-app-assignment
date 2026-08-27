import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import socket from "../socket";
import UserList from "../components/UserList.jsx";
import ChatThread from "../components/ChatThread.jsx";

export default function Chat({ user, onLogout }) {
  const [users, setUsers] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [onlineCount, setOnlineCount] = useState(0);
  const [messages, setMessages] = useState([]);
  const [unread, setUnread] = useState({});
  const navigate = useNavigate();

  const openChat = (u) => {
  setActiveUser(u);
  setMessages([]);
  setUnread((prev) => ({ ...prev, [u._id]: 0 }));
  socket.emit("chat:read", u._id);
  socket.emit("chat:history", u._id, (res) => {
  setMessages(res.messages || []);
  });
};

 useEffect(() => {
  api.get("/chat/users")
    .then((res) => {
      // Access res.data.users directly
      const fetchedUsers = res.data.users || res.data;
      setUsers(Array.isArray(fetchedUsers) ? fetchedUsers : []);
    })
    .catch((err) => {
      console.error("Failed to load users:", err);
      setUsers([]);
    });
}, []);

useEffect(() => {
    api.get("/chat/unread-counts")
    .then((res) => setUnread(res.data.unread || {}))
    .catch((err) => console.error("Failed to load unread counts:", err));
}, []);

useEffect(() => {
    if (!socket.connected) socket.connect();
    socket.on("users:count", (count) => {
      setOnlineCount(count);
    });
    return () => {
      socket.off("users:count");
      socket.disconnect();
    };
  }, []);

 useEffect(() => {
  const handleIncoming = (msg) => {
    const isCurrentThread =
      activeUser &&
      (msg.sender._id === activeUser._id || msg.recipient === activeUser._id);

    if (isCurrentThread) {
      setMessages((prev) => [...prev, msg]);
    } else if (msg.sender._id !== user._id) {
      setUnread((prev) => ({
        ...prev,
        [msg.sender._id]: (prev[msg.sender._id] || 0) + 1,
      }));
    }
  }
  socket.on("chat:message", handleIncoming);
  return () => socket.off("chat:message", handleIncoming);
}, [activeUser, user._id]);

useEffect(() => {
  const handleReadAck = ({ by }) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.sender._id === user._id && !m.read ? { ...m, read: true } : m
      )
    );
  };
  socket.on("chat:read-ack", handleReadAck);
  return () => socket.off("chat:read-ack", handleReadAck);
}, [user._id]);

  const sendMessage = (text) => {
  if (!text.trim() || !activeUser) return;
  socket.emit("chat:send", { to: activeUser._id, text });
};

  const logout = async () => {
    await api.post("/auth/logout");
    socket.disconnect();
    onLogout();
    navigate("/login");
  };

  return (
    <div className="app">
      <UserList
        me={user}
        users={users}
        activeUser={activeUser}
        unread={unread}
        onlineCount={onlineCount}
        onSelect={openChat}
        onLogout={logout}
      />
      {activeUser ? (
        <ChatThread
          me={user}
          other={activeUser}
           messages={messages}
           
  onSend={sendMessage}
         
        />
      ) : (
        <div className="main">
          <div className="empty">
            <div className="empty-icon">💬</div>
            <h3>WhatsApp Style Chat</h3>
            <p>Select a user from the left to start chatting.</p>
            <span className="online-pill">Online users: {onlineCount}</span>
          </div>
        </div>
      )}
    </div>
  );
}
