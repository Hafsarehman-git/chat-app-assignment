const { Server } = require("socket.io");
const Message = require("./models/Message"); 
const onlineUsers = new Set();
const userSockets = new Map();
const jwt = require("jsonwebtoken");
const cookie = require("cookie");

function initSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL,
      credentials: true,
    },
  });
    io.use((socket, next) => {
    try {
      const rawCookies = socket.handshake.headers.cookie;
      if (!rawCookies) return next(new Error("No cookies"));
      const parsed = cookie.parse(rawCookies);
      const token = parsed.token;
      if (!token) return next(new Error("No token"));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (err) {
      next(new Error("Authentication failed"));
    }
  });

  io.on("connection", (socket) => {
    onlineUsers.add(socket.id);
    userSockets.set(socket.userId, socket.id);
    io.emit("users:count", onlineUsers.size);

    socket.on("chat:history", async (otherUserId, callback) => {
      try {
        const currentUserId = socket.userId;

        const messages = await Message.find({
          $or: [
            { sender: currentUserId, recipient: otherUserId },
            { sender: otherUserId, recipient: currentUserId },
          ],
        })
          .sort({ createdAt: 1 })
          .populate("sender", "_id name email");

        if (typeof callback === "function") {
          callback({ messages });
        }
      } catch (err) {
        if (typeof callback === "function") {
          callback({ error: "Failed to fetch chat history" });
        }
      }
    });

    socket.on("chat:send", async ({ to, text }, callback) => {
      try {
        const senderId = socket.userId;

        const newMessage = await Message.create({
          sender: senderId,
          recipient: to,
          text,
        });

        const populatedMessage = await Message.findById(newMessage._id).populate(
          "sender",
          "_id name email"
        );

       const recipientSocketId = userSockets.get(to);
       if (recipientSocketId) {
        io.to(recipientSocketId).emit("chat:message", populatedMessage);
      }
      io.to(socket.id).emit("chat:message", populatedMessage); // echo back to sender
        if (typeof callback === "function") {
          callback({ status: "ok" });
        }
      } catch (err) {
        if (typeof callback === "function") {
          callback({ error: "Failed to send message" });
        }
      }
    });

    socket.on("chat:read", async (otherUserId) => {
  try {
    await Message.updateMany(
      { sender: otherUserId, recipient: socket.userId, read: false },
      { $set: { read: true } }
    );
     const senderSocketId = userSockets.get(otherUserId);
    if (senderSocketId) {
      io.to(senderSocketId).emit("chat:read-ack", { by: socket.userId });
    }
  } catch (err) {
    console.error("Failed to mark messages as read:", err);
  }
});
 

    socket.on("disconnect", () => {
      onlineUsers.delete(socket.id);
      userSockets.delete(socket.userId);
      io.emit("users:count", onlineUsers.size);
    });
  });

  return io;
}

module.exports = { initSocket };