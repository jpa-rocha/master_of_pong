const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

io.on("connection", (socket) => {
  console.log("a user connected");
  io.emit("user connected", "A user has connected");

  socket.on("disconnect", () => {
    console.log("user disconnected");
    io.emit("user disconnected", "A user has disconnected");
  });

  socket.on("chat message", (message, nickname, id) => {
    io.emit('chat message', { message: message, nickname: nickname, id: id });
  });

  socket.on("typing", (data) => {
    socket.broadcast.emit("typing", data);
  });

  socket.on("stop typing", (data) => {
    socket.broadcast.emit("stop typing", data);
  });

});

server.listen(3000, () => {
  console.log("listening on *:3000");
});
