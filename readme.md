# ChatApp

A real-time one-to-one chat application built with React, Express, Socket.IO, and MongoDB.

**Author:** Hafsa

## How to Run

1. **Install dependencies** (from the project root):
   
   npm install

2. **Set up environment variables.** Create a `.env` file in the `server` folder with:

   PORT=3000
   DB_URL=mongodb://127.0.0.1:27017/chat_web
   CLIENT_URL=http://localhost:5173
   JWT_SECRET=my_secret_key


3. **Start the backend** (in one terminal, from the project root):
   npm run dev:server

4. **Start the frontend** (in a separate terminal, from the project root):
   npm run dev:client
  

5. Open your browser at `http://localhost:5173`.

Socket Events
1.chat:history (Client → Server) — Requests past messages between the current user and another user.

2.chat:send (Client → Server) — Sends a new message to a specific recipient.

3.chat:message (Server → Client) — Delivers a new message to the sender and recipient in real time.

4.chat:read (Client → Server) — Marks all messages from a specific user as read.

5.chat:read-ack (Server → Client) — Notifies the original sender that their messages were read.

6.users:count (Server → Client) — Broadcasts the current number of online users.

7.disconnect (Client → Server) — Fired automatically when a user's socket connection closes.