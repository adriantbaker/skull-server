const Game = require('../../utils/classes/Game');

const createGame = (io, socket, lobby) => (request) => {
    const { gameName, ownerName } = request;
    // Add game to lobby
    const game = new Game(gameName, ownerName);
    lobby.addGame(game);

    // Notify lobby and creator of new game
    io.to('gameLobby').emit('games', lobby.getGames());
    socket.emit('createGameResponse', game);

    // Subscribe user to game room, leave lobby
    const gameId = game.id;
    socket.leave('gameLobby');
    socket.join(gameId);
}

module.exports = createGame