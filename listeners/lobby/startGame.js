const startGame = (io, socket, lobby, activeGames) => (request) => {
    console.log('Game owner is starting game...');
    const { gameId } = request;

    // Hide game from lobby; keep track of it in our active games list
    const game = lobby.removeGame(gameId);
    const remainingGames = lobby.getGamesPublic();
    io.to('gameLobby').emit('games', remainingGames);
    activeGames.addGame(game);

    game.startGame();

    // Tell each player the game has started and what their starting setup is
    const players = game.gameInfo.players.getPlayers();
    players.forEach(player => {
        const socketId = player.socketId;
        io.to(socketId).emit('gameStarted', player)
    })
}

module.exports = startGame;