const socket = io();

let audio;
let mayorSound;

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
