const Player = require('../../utils/classes/Player/Player');

const joinGame = (io, socket, lobby) => (request) => {
    console.log('Player is joining game...');
    const { gameId, playerName } = request;

    // Add user to game
    const game = lobby.getGame(gameId);
    console.log(game);
    const player = new Player(socket.id, playerName);
    game.addPlayer(player);

    // Notify joiner of successful join
    socket.emit('joinGameResponse', { game: game.getPublic(), player });

    // Notify lobby and game room that player joined
    console.log('Sending games');
    console.log(lobby.getGamesPublic());
    io.to('gameLobby').emit('games', lobby.getGamesPublic());
    console.log(game.players.getPlayersPublic());
    io.to(gameId).emit('updateGame', { players: game.players.getPlayersPublic() });

    // Subscribe user to game room, leave lobby
    socket.leave('gameLobby');
    socket.join(gameId);
};

module.exports = joinGame;
