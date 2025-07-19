const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
app.use(cors());
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  }
});

io.on("connection", (socket) => {
  console.log("User connected: ", socket.id);

  socket.on("set_username", (username) => {
    socket.username = username;
  });

  socket.on("send_message", (text) => {
    const message = { user: socket.username, text };
    io.emit("receive_message", message);
  });

  socket.on("typing", () => {
    socket.broadcast.emit("user_typing", socket.username);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected", socket.id);
  });
});

server.listen(3001, () => {
  console.log("Server running on port 3001");
});