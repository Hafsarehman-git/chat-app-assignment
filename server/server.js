const dotenv=require("dotenv");
dotenv.config();
const http = require("http");

const express = require("express");
const server = express();

const { connectDB } = require("./config/db");
const { auth } = require("./routes/user");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const chatRoutes = require("./routes/chat");
const { initSocket } = require("./socket");

server.use(express.json()); 
server.use(cookieParser()); 
server.use(
  cors({
    origin: process.env.CLIENT_URL, 
    credentials: true, 
  }),
);
server.use("/auth", auth);
server.use("/chat", chatRoutes);
connectDB();

const httpServer = http.createServer(server);
initSocket(httpServer);

httpServer.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
