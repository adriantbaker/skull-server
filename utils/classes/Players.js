const shuffle = require("../helpers/shuffle");

class Players {
    constructor(players = []) {
        this.players = {};
        players.forEach(player => {
            this.players[player.id] = player;
        })
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

    getPlayersPublic() {
        return Object.values(this.players)
            .map(player => player.getPublic());
    }

    getOpponentsPublic(playerId) {
        return Object.values(this.players)
            .filter(player => player.id !== playerId)
            .map(player => player.getPublic());
    }

    getNumPlayers() {
        return Object.keys(this.players).length;
    }

    assignTurnOrder() {
        const playerIds = Object.keys(this.players);
        shuffle(playerIds);
        playerIds.forEach((playerId, i) => {
            this.players[playerId].turnOrder = i;
        })
        this.turnOrder = playerIds;
    }
}

module.exports = Players;