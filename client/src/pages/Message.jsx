import { useEffect, useState } from "react";
import socket from "../socket";

export default function Message({ me, activeUser, onClose }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  useEffect(() => {
    if (!activeUser) return;

    setMessages([]); 

    socket.emit("chat:history", activeUser._id, (history) => {
      setMessages(history.messages || []);
    });

    socket.emit("chat:read", activeUser._id);

    const handleIncomingMessage = (incomingMsg) => {
      if (
        incomingMsg.sender === activeUser._id ||
        incomingMsg.receiver === activeUser._id
      ) {
        setMessages((prev) => [...prev, incomingMsg]);
      }
    };

    socket.on("chat:message", handleIncomingMessage);

    return () => {
      socket.off("chat:message", handleIncomingMessage);
    };
  }, [activeUser]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    socket.emit("chat:send", { to: activeUser._id, text });
    setText(""); 
  };

  return (
    <div className="chat-thread">
      <div className="chat-header">
        <h3>{activeUser.name}</h3>
        <button onClick={onClose}>Close</button>
      </div>

      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div
            key={msg._id || index}
            className={`message ${msg.sender === me._id ? "sent" : "received"}`}
          >
            {msg.message || msg.text}
          </div>
        ))}
      </div>

      <form onSubmit={handleSend} className="chat-input">
        <input
          type="text"
          value={text}
          placeholder={`Message ${activeUser.name}...`}
          onChange={(e) => setText(e.target.value)}
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}