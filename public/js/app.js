const socket = io();

let audio;
let mayorSound;

const thiefSound = new Audio('/mp3/voleur.mp3');
const magicSound = new Audio('/mp3/magie.mp3');

document.addEventListener("DOMContentLoaded", () => {
  audio = new Audio("/mp3/dead.mp3");
  mayorSound = new Audio("/mp3/maire-elu.mp3");
  document.getElementById("activateSound").addEventListener("click", () => {
    audio
      .play()
      .then(() => {
        mayorSound.play();
        audio.pause();
        mayorSound.pause();
        document.getElementById("activateSound").style.display = "none";
      })
      .catch((error) => {
        console.log("Erreur lors de l'activation du son:", error);
      });
  });
});

function generatePlayerCard(player) {
  const playerCard = document.createElement("div");
  playerCard.classList.add("player-card");
  if (!player.alive) {
    playerCard.classList.add("dead");
  }

  const playerImage = document.createElement("img");
  if (player.alive) {
    playerImage.src = "/images/player.png";
  } else {
    playerImage.src = `/images/${player.role
      .toLowerCase()
      .replace(" ", "-")}.png`;
  }
  playerImage.alt = player.name;
  playerImage.classList.add("player-image");
  playerCard.appendChild(playerImage);

  const playerName = document.createElement("h3");
  playerName.classList.add("player-name");
  playerName.innerText = player.name;

  if (player.mother) {
    const crownIcon = document.createElement("i");
    crownIcon.classList.add("fa-solid", "fa-crown", "crown-icon");
    playerName.appendChild(crownIcon);
  }

  playerCard.appendChild(playerName);

  if (!player.alive) {
    const deathOverlay = document.createElement("img");
    deathOverlay.src = "/images/mort.png";
    deathOverlay.alt = "Mort";
    deathOverlay.classList.add("death-overlay");
    playerCard.appendChild(deathOverlay);
  }

  return playerCard;
}

function updatePlayerCards(players) {
  const playersList = document.getElementById("playersList");
  playersList.innerHTML = "";
  players.forEach((player) => {
    const playerCard = generatePlayerCard(player);
    playersList.appendChild(playerCard);
  });
}

socket.on("updatePlayers", (players) => {
  updatePlayerCards(players);
});

socket.on("playerDied", (playerName) => {
  if (audio) {
    audio.play();
  }
});

socket.on('playMagicSound', () => {
  console.log("Jouer le son de magie !");
  magicSound.play();
});

socket.on('showPlayerRole', ({ name, role }) => {
  console.log(`Afficher le rôle de ${name} : ${role}`);
  const roleCard = document.createElement('div');
  roleCard.classList.add('player-role-card');
  roleCard.innerHTML = `
      <h2>${name}</h2>
      <img src="/images/${role.toLowerCase().replace(' ', '-')}.png" alt="${role}">
  `;

  document.body.appendChild(roleCard);

  setTimeout(() => {
      roleCard.remove();
  }, 3000);
});

socket.on("playerBecameMayor", (playerName) => {
  if (mayorSound) {
    mayorSound.play();
  }
  fetch("/api/getPlayers")
    .then((response) => response.json())
    .then((players) => {
      updatePlayerCards(players);
    })
    .catch((error) =>
      console.error("Erreur lors de la mise à jour des joueurs:", error)
    );
});

socket.on("gamePaused", () => {
  let overlay = document.getElementById("pauseOverlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "pauseOverlay";
    overlay.innerText = "Le jeu est en pause";
    document.body.appendChild(overlay);
  }
  overlay.style.display = "flex";
});

socket.on("gameResumed", () => {
  const overlay = document.getElementById("pauseOverlay");
  if (overlay) {
    overlay.style.display = "none";
  }
});

socket.on('playThiefSound', () => {
    console.log("Le voleur change de rôle, jouer le son !");
    thiefSound.play();
});

socket.on('gameEnded', () => {
  console.log("La partie est terminée. Réinitialisation des interfaces.");
  document.getElementById('playersList').innerHTML = '';
  if (window.location.pathname.includes('app.html')) {
      window.location.reload();
  }
});
