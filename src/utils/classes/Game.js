const shuffle = require("../helpers/shuffle");
const CoupGame = require("./CoupGame");
const Players = require("./Players");

class Game {
    constructor(name, owner) {
        console.log("Constructing new game - " + name);
        this.id = owner.id + name + Date.now();
        this.owner = owner;
        this.name = name;
        this.players = new Players([owner]);
        this.started = false;
        this.gameInfo = null;
        this.currentTurn = -1;
    }

    addPlayer(player) {
        this.players.addPlayer(player)
    }

    removePlayer(player) {
        this.players.removePlayer(player.id);
    }

    startGame() {
        this.players.assignTurnOrder();
        this.started = true;
        this.currentTurn = 0;
        this.gameInfo = new CoupGame(this.players);
    }

    getPublic() {
        return {
            id: this.id,
            owner: this.owner,
            name: this.name,
            started: this.started,
            players: this.players.getPlayersPublic()
        }
    }
}

module.exports = Game;