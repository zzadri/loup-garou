const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const Game = require('./game');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const game = new Game();

app.use(express.static(path.join(__dirname, '../frontend/dist')));
app.use(express.static(path.join(__dirname, '../public')));

app.get('/api/getPlayers', (req, res) => {
  res.json(game.players);
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

io.on('connection', (socket) => {
  console.log('Nouvelle connexion client');
  socket.emit('rolesConfig', game.rolesConfig);

  socket.on('addPlayer', ({ name }) => {
    const newPlayer = game.addPlayer(name, socket.id);
    if (!newPlayer) {
      socket.emit('noMoreRoles');
      return;
    }
    io.emit('updatePlayers', game.players);
    socket.emit('playerAdded', newPlayer);
  });

  socket.on('updateRolesConfig', (newConfig) => {
    game.rolesConfig = newConfig;
    io.emit('rolesConfig', game.rolesConfig);
  });

  socket.on('killPlayer', (name) => {
    const res = game.killPlayer(name);
    if (!res) return;
    io.emit('updatePlayers', game.players);
    if (res.transformed) {
      socket.emit('ancienToVillageois', name);
    } else {
      io.emit('playerDied', name);
    }
  });

  socket.on('revivePlayer', (name) => {
    game.revivePlayer(name);
    io.emit('updatePlayers', game.players);
  });

  socket.on('removePlayer', (name) => {
    const socketId = game.getSocketId(name);
    game.removePlayer(name);
    if (socketId) io.to(socketId).emit('redirectToLogin');
    io.emit('updatePlayers', game.players);
  });

  socket.on('showRoleOnTV', ({ name, role }) => {
    io.emit('showPlayerRole', { name, role });
    io.emit('playMagicSound');
  });

  socket.on('assignMother', (name) => {
    game.assignMother(name);
    io.emit('playerBecameMayor', name);
    io.emit('updatePlayers', game.players);
  });

  socket.on('removeCurrentMayor', () => {
    game.removeMother();
    io.emit('updatePlayers', game.players);
  });

  socket.on('thiefSwitchRole', ({ thiefName, targetName }) => {
    const res = game.thiefSwitchRole(thiefName, targetName);
    if (!res) return;
    io.emit('updatePlayers', game.players);
    const thiefId = game.getSocketId(thiefName);
    if (thiefId) io.to(thiefId).emit('updateRole', { role: res.thiefRole });
    const targetId = game.getSocketId(targetName);
    if (targetId) io.to(targetId).emit('updateRole', { role: res.targetRole });
  });

  socket.on('disconnect', () => {
    console.log('Client déconnecté');
    if (socket.id) {
      Object.keys(game.playerSockets).forEach((name) => {
        if (game.playerSockets[name] === socket.id) delete game.playerSockets[name];
      });
    }
  });

  socket.on('endGame', () => {
    game.endGame();
    io.emit('gameEnded');
    io.emit('updatePlayers', game.players);
    io.emit('redirectToLogin');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Serveur en cours d'exécution sur le port ${PORT}`);
});
