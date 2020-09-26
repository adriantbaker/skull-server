const startGame = (io, socket, lobby) => (request) => {
    console.log('Game owner is starting game...');
    const { gameId } = request;

    const game = lobby.getGame(gameId);
    game.startGame();

    console.log(game)
    const players = game.gameInfo.players;
    players.forEach(player => {
        console.log(player);
        console.log('Cards:')
        player.cards.forEach(card => {
            console.log(card);
        })
    })
}

module.exports = startGame;