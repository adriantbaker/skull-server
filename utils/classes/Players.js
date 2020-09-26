class Players {
    constructor() {
        this.players = {};
    }

    addPlayer(player) {
        this.players[player.id] = player;
    }

    removePlayer(playerId) {
        delete this.players[playerId];
    }

    getPlayer(playerId) {
        return this.players[playerId];
    }

    getPlayers() {
        return Object.values(this.players);
    }

    getNumPlayers() {
        return Object.keys(this.players).length;
    }
}

module.exports = Players;