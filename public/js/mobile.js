const socket = io();
const joinButton = document.getElementById("joinGameButton");
const usernameInput = document.getElementById("username");
const gameInfoSection = document.getElementById("gameInfoSection");
const loginSection = document.getElementById("loginSection");
const playerNameDisplay = document.getElementById("playerName");
const playerCard = document.getElementById("playerCard");
const roleImage = document.getElementById("roleImage");

let playerRole = null;
joinButton.addEventListener("click", () => {
  const playerName = usernameInput.value.trim();

  if (playerName) {
    socket.emit("addPlayer", {
      name: playerName,
      role: null,
      alive: true,
      mother: false,
    });
    playerNameDisplay.textContent = playerName;
    loginSection.style.display = "none";
    gameInfoSection.style.display = "block";
  } else {
    alert("Veuillez entrer un nom valide !");
  }
});
socket.on("playerAdded", (player) => {
  if (player.name === playerNameDisplay.textContent) {
    playerRole = player.role;
    console.log(`Votre rôle est : ${playerRole}`);
    roleImage.src = `/images/${playerRole.toLowerCase().replace(" ", "")}.png`;
  }
});
playerCard.addEventListener("click", () => {
  if (playerCard.classList.contains("hidden")) {
    playerCard.classList.remove("hidden");
    playerCard.classList.add("revealed");
  } else {
    playerCard.classList.remove("revealed");
    playerCard.classList.add("hidden");
  }
});

socket.on("noMoreRoles", () => {
  alert("Désolé, il n'y a plus de rôles disponibles pour cette partie.");
});

// Ajouter cet événement pour recevoir la mise à jour du rôle
socket.on('updateRole', (data) => {
  console.log('Votre rôle a changé :', data.role);

  // Mettre à jour l'image de la carte avec le nouveau rôle
  roleImage.src = `/images/${data.role.toLowerCase().replace(' ', '-')}.png`;
});


// Écouter l'événement de redirection
socket.on('redirectToLogin', () => {
  console.log("redirection vers la page de connexion.");
  window.location.reload();
});
