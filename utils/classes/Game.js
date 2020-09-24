const CoupGame = require("./CoupGame");

class Game {
    constructor(name, owner) {
        console.log("Constructing new game - " + name);
        this.id = owner + Date.now();
        this.owner = owner;
        this.name = name;
        this.players = [owner];
        this.started = false;
        this.gameInfo = null;
    }

    addPlayer(playerName) {
        this.players.push(playerName);
    }

    removePlayer(playerName) {
        this.players = this.players.filter(p => p !== playerName);
    }

    startGame() {
        this.started = true;
        this.gameInfo = new CoupGame(this.players);
    }

    // set id(id) {
    //     this.id = id;
    // }

    // get id() {
    //     return this.id;
    // }

    // get players() {
    //     return this.players;
    // }
}

module.exports = Game;