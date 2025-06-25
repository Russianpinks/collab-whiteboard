const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

// Create Express app and HTTP server
const app = express();
const server = http.createServer(app);

// Setup Socket.io
const io = new Server(server, {
  cors: {
    origin: "*", // Replace with your frontend URL in production
    methods: ["GET", "POST"]
  }
});

app.use(cors());

const rooms = {}; // { roomId: [username1, username2, ...] }

io.on("connection", (socket) => {
  console.log("✅ New user connected:", socket.id);

  // Handle room join
  socket.on("join-room", ({ roomId, username }) => {
    socket.join(roomId);
    socket.roomId = roomId;
    socket.username = username;

    if (!rooms[roomId]) rooms[roomId] = [];
    if (!rooms[roomId].includes(username)) {
      rooms[roomId].push(username);
    }

    console.log(`👤 ${username} joined room: ${roomId}`);
    io.to(roomId).emit("participants-updated", rooms[roomId]);
  });

  // Handle drawing sync
  socket.on("draw", (data) => {
    socket.to(data.roomId).emit("draw", data);
  });

  // Handle canvas clear
  socket.on("clear", (roomId) => {
    socket.to(roomId).emit("clear");
  });

  // Optional: handle explicit leave-room
  socket.on("leave-room", ({ roomId, username }) => {
    if (roomId && rooms[roomId]) {
      rooms[roomId] = rooms[roomId].filter((u) => u !== username);
      console.log(`❌ ${username} left room: ${roomId}`);
      io.to(roomId).emit("participants-updated", rooms[roomId]);
    }
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    const { roomId, username } = socket;
    if (roomId && rooms[roomId]) {
      rooms[roomId] = rooms[roomId].filter((u) => u !== username);
      console.log(`🔌 ${username} disconnected from room: ${roomId}`);
      io.to(roomId).emit("participants-updated", rooms[roomId]);
    }
  });
});

// Start server
const PORT = 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
