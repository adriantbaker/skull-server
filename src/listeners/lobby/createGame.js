const Game = require('../../utils/classes/Game');
const Player = require('../../utils/classes/Player');

const createGame = (io, socket, lobby) => (request) => {
    console.log("Got game create")
    const { gameName, ownerName } = request;
    // Add game to lobby
    const owner = new Player(socket.id, ownerName, true);
    const game = new Game(gameName, owner);
    lobby.addGame(game);

    // Notify lobby and creator of new game
    console.log("Sending games");
    console.log(lobby.getGamesPublic())
    io.to('gameLobby').emit('games', lobby.getGamesPublic());
    socket.emit('createGameResponse', { game: game.getPublic(), player: owner });

    // Subscribe user to game room, leave lobby
    const gameId = game.id;
    socket.leave('gameLobby');
    socket.join(gameId);
}

module.exports = createGame