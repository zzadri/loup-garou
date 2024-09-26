const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let rolesConfig = {
  "Loup-Garou": { count: 2, assigned: 0, probability: 0.1 },
  Sorcière: { count: 1, assigned: 0, probability: 0.1 },
  Villageois: { count: 1, assigned: 0, probability: 0.1 },
  Cupidon: { count: 1, assigned: 0, probability: 0.1 },
  Chasseur: { count: 1, assigned: 0, probability: 0.1 },
  Voyante: { count: 1, assigned: 0, probability: 0.1 },
  Voleur: { count: 1, assigned: 0, probability: 0.1 },
  "Petite-Fille": { count: 1, assigned: 0, probability: 0.1 },
  Ancien: { count: 1, assigned: 0, probability: 0.1 },
  Juge: { count: 1, assigned: 0, probability: 0.1 },
};

let players = [];
let playerSockets = {};

app.use(express.static("public"));
app.get("/api/getPlayers", (req, res) => {
  res.json(players);
});

io.on("connection", (socket) => {
  console.log("Nouvelle connexion client");

  socket.emit("rolesConfig", rolesConfig);

  socket.on("addPlayer", (playerData) => {
    const assignedRole = assignRoleToPlayer();

    if (assignedRole === "Aucun rôle disponible") {
      socket.emit("noMoreRoles");
      return;
    }

    const newPlayer = {
      name: playerData.name,
      role: assignedRole,
      alive: true,
      mother: false,
    };

    players.push(newPlayer);

    playerSockets[newPlayer.name] = socket.id;

    io.emit("updatePlayers", players);

    socket.emit("playerAdded", newPlayer);
  });

  socket.on("updateRolesConfig", (newConfig) => {
    rolesConfig = newConfig;
    console.log("Configuration des rôles mise à jour", rolesConfig);
    io.emit("rolesConfig", rolesConfig);
  });
  socket.on("killPlayer", (playerName) => {
    const player = players.find((p) => p.name === playerName);
    if (player) {
      player.alive = false;
      io.emit("updatePlayers", players);
      io.emit("playerDied", playerName);
    }
  });

  socket.on("revivePlayer", (playerName) => {
    const player = players.find((p) => p.name === playerName);
    if (player) {
      player.alive = true;
      io.emit("updatePlayers", players);
    }
  });

  socket.on("removePlayer", (playerName) => {
    const playerIndex = players.findIndex(
      (player) => player.name === playerName
    );

    if (playerIndex !== -1) {
      const playerRole = players[playerIndex].role;
      if (rolesConfig[playerRole]) {
        rolesConfig[playerRole].assigned--;
      }
      players.splice(playerIndex, 1);
      io.emit("updatePlayers", players);
    }
  });

  socket.on('showRoleOnTV', ({ name, role }) => {
    console.log(`Montrer le rôle de ${name} (${role}) sur la TV`);
    io.emit('showPlayerRole', { name, role });
    io.emit('playMagicSound');
  });

  socket.on("assignMother", (playerName) => {
    players.forEach((player) => {
      if (player.name === playerName) {
        player.mother = true;
      } else {
        player.mother = false;
      }
    });
    io.emit("playerBecameMayor", playerName);
    io.emit("updatePlayers", players);
  });

  socket.on("removeCurrentMayor", () => {
    players.forEach((player) => {
      player.mother = false;
    });
    io.emit("updatePlayers", players);
  });

  socket.on("thiefSwitchRole", ({ thiefName, targetName }) => {
    const thief = players.find((p) => p.name === thiefName);
    const target = players.find((p) => p.name === targetName);

    if (!thief || !target) {
      console.log("Erreur : joueurs non trouvés pour l'échange");
      return;
    }

    const thiefRole = thief.role;
    thief.role = target.role;
    target.role = "Villageois";

    io.emit("updatePlayers", players);

    io.emit("playThiefSound");

    const thiefSocketId = getPlayerSocketId(thiefName);
    if (thiefSocketId) {
        io.to(thiefSocketId).emit("updateRole", { role: thief.role });
    }
  });


  socket.on("disconnect", () => {
    console.log("Client déconnecté");
    for (let playerName in playerSockets) {
      if (playerSockets[playerName] === socket.id) {
        delete playerSockets[playerName];
      }
    }
  });
});

server.listen(3000, () => {
  console.log("Serveur en cours d'exécution sur le port 3000");
});

function assignRoleToPlayer() {
  let availableRoles = Object.keys(rolesConfig).filter((role) => {
    return rolesConfig[role].assigned < rolesConfig[role].count;
  });

  if (availableRoles.length === 0) {
    return "Aucun rôle disponible";
  }

  let totalProbability = availableRoles.reduce(
    (total, role) => total + rolesConfig[role].probability,
    0
  );
  let random = Math.random() * totalProbability;
  let cumulativeProbability = 0;

  for (let role of availableRoles) {
    cumulativeProbability += rolesConfig[role].probability;
    if (random <= cumulativeProbability) {
      rolesConfig[role].assigned++;
      return role;
    }
  }

  const randomRole =
    availableRoles[Math.floor(Math.random() * availableRoles.length)];
  rolesConfig[randomRole].assigned++;
  return randomRole;
}


function getPlayerSocketId(playerName) {
  return playerSockets[playerName];
}