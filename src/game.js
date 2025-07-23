class Game {
  constructor() {
    this.reset();
  }

  reset() {
    this.rolesConfig = {
      "Loup-Garou": { count: 2, assigned: 0, probability: 0.1 },
      "Sorcière": { count: 1, assigned: 0, probability: 0.1 },
      "Villageois": { count: 1, assigned: 0, probability: 0.1 },
      "Cupidon": { count: 1, assigned: 0, probability: 0.1 },
      "Chasseur": { count: 1, assigned: 0, probability: 0.1 },
      "Voyante": { count: 1, assigned: 0, probability: 0.1 },
      "Voleur": { count: 1, assigned: 0, probability: 0.1 },
      "Petite-Fille": { count: 1, assigned: 0, probability: 0.1 },
      "Ancien": { count: 0, assigned: 0, probability: 0.1 },
      "Juge": { count: 0, assigned: 0, probability: 0.1 },
      "Loup-blanc": { count: 0, assigned: 0, probability: 0.1 },
      "Idiot": { count: 0, assigned: 0, probability: 0.1 },
      "Ange": { count: 0, assigned: 0, probability: 0.1 },
      "Montreur d'ours": { count: 0, assigned: 0, probability: 0.1 },
    };
    this.players = [];
    this.playerSockets = {};
    this.ancienKilledOnce = false;
  }

  assignRole() {
    const availableRoles = Object.keys(this.rolesConfig).filter(
      (role) => this.rolesConfig[role].assigned < this.rolesConfig[role].count
    );
    if (!availableRoles.length) return "Aucun rôle disponible";

    const totalProbability = availableRoles.reduce(
      (t, role) => t + this.rolesConfig[role].probability,
      0
    );
    let random = Math.random() * totalProbability;
    let cumulative = 0;
    for (const role of availableRoles) {
      cumulative += this.rolesConfig[role].probability;
      if (random <= cumulative) {
        this.rolesConfig[role].assigned++;
        return role;
      }
    }
    const randomRole =
      availableRoles[Math.floor(Math.random() * availableRoles.length)];
    this.rolesConfig[randomRole].assigned++;
    return randomRole;
  }

  addPlayer(name, socketId) {
    const role = this.assignRole();
    if (role === "Aucun rôle disponible") return null;
    const player = { name, role, alive: true, mother: false };
    this.players.push(player);
    this.playerSockets[name] = socketId;
    return player;
  }

  killPlayer(name) {
    const player = this.players.find((p) => p.name === name);
    if (!player) return null;
    if (player.role === "Ancien" && !this.ancienKilledOnce) {
      this.ancienKilledOnce = true;
      player.role = "Villageois";
      return { transformed: true };
    }
    player.alive = false;
    return { transformed: false };
  }

  revivePlayer(name) {
    const p = this.players.find((pl) => pl.name === name);
    if (p) p.alive = true;
  }

  removePlayer(name) {
    const idx = this.players.findIndex((p) => p.name === name);
    if (idx !== -1) {
      const role = this.players[idx].role;
      if (this.rolesConfig[role]) this.rolesConfig[role].assigned--;
      delete this.playerSockets[name];
      this.players.splice(idx, 1);
    }
  }

  assignMother(name) {
    this.players.forEach((p) => {
      p.mother = p.name === name;
    });
  }

  removeMother() {
    this.players.forEach((p) => (p.mother = false));
  }

  thiefSwitchRole(thiefName, targetName) {
    const thief = this.players.find((p) => p.name === thiefName);
    const target = this.players.find((p) => p.name === targetName);
    if (!thief || !target) return false;
    const thiefRole = thief.role;
    thief.role = target.role;
    target.role = "Villageois";
    return { thiefRole: thief.role, targetRole: target.role };
  }

  endGame() {
    this.players = [];
    Object.values(this.rolesConfig).forEach((r) => (r.assigned = 0));
    this.ancienKilledOnce = false;
  }

  getSocketId(name) {
    return this.playerSockets[name];
  }
}

module.exports = Game;
