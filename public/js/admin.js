const socket = io();
let selectedPlayer = null;
let players = [];

document.addEventListener("DOMContentLoaded", () => {
  fetch("/api/getPlayers")
    .then((response) => response.json())
    .then((fetchedPlayers) => {
      players = fetchedPlayers;
      updatePlayerCards(players);
    })
    .catch((error) =>
      console.error("Erreur lors du chargement des joueurs:", error)
    );

  socket.on("rolesConfig", (rolesConfig) => {
    const roleList = document.getElementById("roleList");
    const playerRoleSelect = document.getElementById("playerRole");

    roleList.innerHTML = "";
    playerRoleSelect.innerHTML = "";

    Object.keys(rolesConfig).forEach((role) => {
      const roleDiv = document.createElement("div");
      roleDiv.innerHTML = `
                <label>${role}</label>
                <input type="number" id="${role}Count" value="${rolesConfig[role].count}" min="0">
            `;
      roleList.appendChild(roleDiv);

      const option = document.createElement("option");
      option.value = role;
      option.text = role;
      playerRoleSelect.appendChild(option);
    });
  });
});

function addPlayer() {
  let playerName = document.getElementById("playerName").value;
  if (!playerName || playerName.trim() === "") {
    const playerCount = players.length + 1;
    playerName = `Joueur ${playerCount}`;
  }
  const playerRole = document.getElementById("playerRole").value;
  socket.emit("addPlayer", {
    name: playerName,
    role: playerRole,
    alive: true,
    mother: false,
  });
}

function generatePlayerCard(player) {
  const playerCard = document.createElement("div");
  playerCard.classList.add("player-card");

  const playerName = document.createElement("h3");
  playerName.innerText = player.name;
  playerCard.appendChild(playerName);

  const playerRoleImage = document.createElement("img");
  playerRoleImage.src = `/images/${player.role
    .toLowerCase()
    .replace(" ", "-")}.png`;
  playerRoleImage.alt = player.role;
  playerRoleImage.classList.add("role-image");
  playerCard.appendChild(playerRoleImage);

  const playerIcons = document.createElement("div");
  playerIcons.classList.add("player-icons");

  const deleteIcon = document.createElement("i");
  deleteIcon.classList.add("fas", "fa-trash");
  deleteIcon.onclick = () => removePlayer(player.name);
  playerIcons.appendChild(deleteIcon);

  const crownIcon = document.createElement("i");
  crownIcon.classList.add("fas", "fa-crown");
  crownIcon.onclick = () => assignMother(player.name);
  crownIcon.style.color = player.mother ? "gold" : "inherit";
  playerIcons.appendChild(crownIcon);

  const skullIcon = document.createElement("i");
  skullIcon.classList.add("fas", "fa-skull");
  skullIcon.style.color = player.alive ? "inherit" : "red";
  skullIcon.onclick = () => togglePlayerDeath(player.name, player.alive);
  playerIcons.appendChild(skullIcon);

  const exchangeIcon = document.createElement("i");
  exchangeIcon.classList.add("fas", "fa-exchange-alt");
  exchangeIcon.onclick = () => selectPlayerForExchange(player.name);
  playerIcons.appendChild(exchangeIcon);

  const eyeIcon = document.createElement('i');
  eyeIcon.classList.add('fas', 'fa-eye', 'fa-fw');
  eyeIcon.onclick = () => showRoleOnTV(player.name, player.role);
  playerIcons.appendChild(eyeIcon);

  playerCard.appendChild(playerIcons);
  return playerCard;
}

function showRoleOnTV(playerName, playerRole) {
  socket.emit('showRoleOnTV', { name: playerName, role: playerRole });
}

function togglePlayerDeath(playerName, isAlive) {
  if (isAlive) {
    socket.emit("killPlayer", playerName);
  } else {
    socket.emit("revivePlayer", playerName);
  }
}

function updatePlayerCards(players) {
  const playerCardsContainer = document.getElementById("playerCards");
  playerCardsContainer.innerHTML = "";
  players.forEach((player) => {
    const playerCard = generatePlayerCard(player);
    playerCardsContainer.appendChild(playerCard);
  });
}

function removePlayer(playerName) {
  socket.emit("removePlayer", playerName);
}

function assignMother(playerName) {
  socket.emit("removeCurrentMayor");
  socket.emit("assignMother", playerName);
}

function assignRandomRoles() {
  socket.emit("assignRandomRoles");
}

function updateRoleConfig() {
  const newRoleConfig = {};
  document.querySelectorAll("#roleList div").forEach((roleDiv) => {
    const roleLabel = roleDiv.querySelector("label").innerText;
    const roleCount = roleDiv.querySelector("input").value;
    newRoleConfig[roleLabel] = { count: parseInt(roleCount), assigned: 0 };
  });

  socket.emit("updateRolesConfig", newRoleConfig);
}

socket.on("updatePlayers", (updatedPlayers) => {
  players = updatedPlayers;
  updatePlayerCards(players);
});

let thiefSelected = null;

function selectPlayerForExchange(playerName) {
  const player = players.find((p) => p.name === playerName);

  if (!thiefSelected) {
    if (player.role === "Voleur") {
      thiefSelected = playerName;
      alert(
        `${playerName} est sélectionné comme voleur. Sélectionnez un autre joueur pour l'échanger.`
      );
    } else {
      alert("Vous devez d'abord sélectionner un voleur !");
    }
  } else {
    exchangeRolesWithThief(thiefSelected, playerName);
    thiefSelected = null;
  }
}

function exchangeRolesWithThief(thiefName, targetName) {
  socket.emit("thiefSwitchRole", { thiefName, targetName });
}
