class Games {
    constructor() {
        this.games = {};
    }

    addGame(game) {
        this.games[game.id] = game;
    }

    removeGame(gameId) {
        delete this.games[gameId];
    }

    getGame(gameId) {
        return this.games[gameId];
    }

    getGames() {
        return Object.values(this.games);
    }

    getNumGames() {
        return Object.keys(this.games).length;
    }
}

module.exports = Games;