const express = require("express");
const cors = require("cors");
const path = require("path");
const http = require("http");
const socketIO = require("socket.io");

const app = express();
app.use(cors());
const server = http.createServer(app);

const io = socketIO(server);

server.listen(3001);

app.use(express.static(path.join(__dirname, "public")));

let connectedUsers = [];

io.on("connection", (socket) => {
  console.log("Conexao dectada");
  socket.on("join-request", (userName) => {
    socket.userName = userName;
    connectedUsers.push(userName);
    console.log(connectedUsers);
    socket.emit("user-ok", connectedUsers);
    socket.broadcast.emit("list-update", {
      joined: userName,
      list: connectedUsers,
    });
  });

  socket.on("disconnect", () => {
    connectedUsers = connectedUsers.filter((u) => u != socket.userName);
    socket.broadcast.emit("list-update", {
      left: socket.userName,
      list: connectedUsers,
    });
  });

  socket.on("send-msg", (txt) => {
    let obj = {
      userName: socket.userName,
      message: txt,
    };
    socket.broadcast.emit("show-msg", obj);
  });
});
