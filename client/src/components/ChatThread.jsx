import { useState, useEffect, useRef } from "react";

const time = (d) =>
  new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
const dateLabel = (d) => {
  const msgDate = new Date(d);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const isSameDay = (a, b) =>
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear();

  if (isSameDay(msgDate, today)) return "Today";
  if (isSameDay(msgDate, yesterday)) return "Yesterday";
  return msgDate.toLocaleDateString([], { day: "numeric", month: "short", year: "numeric" });
};

export default function ChatThread({ me, other, messages=[], onSend }) {
  const [text, setText] = useState("");
  const bottom = useRef(null);

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = () => {
    onSend(text);
    setText("");
  };

  return (
    <div className="main">
      <div className="main-head">
        <div className="avatar grey">{other.name.charAt(0).toUpperCase()}</div>
        <div>
          <div className="name">{other.name}</div>
          <div className="small green">online</div>
        </div>
      </div>

      <div className="body"> 
        {messages.length === 0 && <p className="muted center-text">No messages yet.</p>}
        {messages.map((m, i) => {
          const showDate =
            i === 0 || dateLabel(messages[i - 1].createdAt) !== dateLabel(m.createdAt);
            return ( 
              <div key={m._id} className="msg-row">
              {showDate && <div className="date-divider">{dateLabel(m.createdAt)}</div>}
            <div className={"bubble " + (m.sender._id === me._id ? "out" : "in")}>
            {m.text}
          <span className="stamp">{time(m.createdAt)}</span>
           {m.sender._id === me._id && (
          <span className={"ticks " + (m.read ? "read" : "")}>✓</span>
        )}
      </div>
    </div>
  );
})}
        <div ref={bottom} />
      </div>

      <div className="foot">
        <input
          value={text}
          placeholder="Type a message"
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
        />
        <button className="send" onClick={send}>➤</button>
      </div>
    </div>
  );
}
