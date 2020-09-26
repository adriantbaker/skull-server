const joinGame = (io, socket, lobby) => (request) => {
    console.log('Player is joining game...')
    const { gameId, playerName } = request;
    // Add user to game
    const game = lobby.getGame(gameId);
    console.log(game)
    game.addPlayer(playerName);

    // Subscribe user to game room, leave lobby
    socket.leave('gameLobby');
    socket.join(gameId);

    // Notify lobby and game room that player joined
    io.to('gameLobby').emit('games', lobby.getGames());
    io.to(gameId).emit('updateGame', { players: game.players })
}

module.exports = joinGame;