const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const { Server, Socket } = require("socket.io");
app.use(cors());

const server = http.createServer(app);
const PORT = 3001;

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on("join_room", (data) => {
    socket.join(data);
    console.log(
      `User ${data.username} with ID: ${socket.id} joined room: ${data.room}`
    );
  });

  socket.on("send_message", (data) => {
    console.log(data);
    socket.broadcast.emit("receive_message", data);
  });

  socket.on("send_score", (data) => {
    socket.broadcast.emit("receive_score", data);
    console.log(data, "receiving messages is also happening (backend)");
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
  });
});

server.listen(PORT, () => {
  console.log("SERVER RUNNING ON " + PORT);
});
