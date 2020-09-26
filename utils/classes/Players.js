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

    getNumPlayers() {
        return Object.keys(this.players).length;
    }
}

module.exports = Players;