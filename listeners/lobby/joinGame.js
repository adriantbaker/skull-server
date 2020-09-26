const Player = require("../../utils/classes/Player");

const joinGame = (io, socket, lobby) => (request) => {
    console.log('Player is joining game...')
    const { gameId, playerName } = request;
    // Add user to game
    const game = lobby.getGame(gameId);
    console.log(game)
    const player = new Player(socket.id, playerName);
    game.addPlayer(player);

    // Subscribe user to game room, leave lobby
    socket.leave('gameLobby');
    socket.join(gameId);

    // Notify lobby and game room that player joined
    io.to('gameLobby').emit('games', lobby.getGamesPublic());
    io.to(gameId).emit('updateGame', { players: game.players.getPlayersPublic() })
}

module.exports = joinGame;