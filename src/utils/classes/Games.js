class Games {
    constructor() {
        this.games = {};
    }

    addGame(game) {
        this.games[game.id] = game;
    }

    removeGame(gameId) {
        const game = this.games[gameId];
        delete this.games[gameId];
        return game;
    }

    getGame(gameId) {
        return this.games[gameId];
    }

    getGamePublic(gameId) {
        return this.games[gameId].getPublic();
    }

    getGames() {
        return Object.values(this.games);
    }

    getGamesPublic() {
        console.log("HI")
        return Object.values(this.games)
            .map(game => game.getPublic())
    }

    getNumGames() {
        return Object.keys(this.games).length;
    }
}

module.exports = Games;