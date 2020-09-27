const startGame = (io, socket, lobby, activeGames) => (request) => {
    console.log('Game owner is starting game...');
    const { gameId } = request;

    // Hide game from lobby; keep track of it in our active games list
    const game = lobby.removeGame(gameId);
    const remainingGames = lobby.getGamesPublic();
    console.log("Sending games");
    console.log(lobby.getGamesPublic())
    io.to('gameLobby').emit('games', remainingGames);
    activeGames.addGame(game);

    game.startGame();

    // Tell each player the game has started
    io.to(gameId).emit('startGame');
}

module.exports = startGame;