const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

const PORT = process.env.PORT || 3000;

let players = {};
let gameStarted = false;

io.on("connection", (socket) => {

  socket.on("join", (name) => {
    players[socket.id] = {
      id: socket.id,
      name: name,
      ready: false
    };
    io.emit("players", players);
  });

  socket.on("ready", () => {
    if (!players[socket.id]) return;

    players[socket.id].ready = !players[socket.id].ready;

    const readyPlayers = Object.values(players).filter(p => p.ready);

    if (readyPlayers.length >= 2) {
      gameStarted = true;
      io.emit("gameStart");
    }

    io.emit("players", players);
  });

  socket.on("disconnect", () => {
    delete players[socket.id];
    io.emit("players", players);
  });

});

server.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
