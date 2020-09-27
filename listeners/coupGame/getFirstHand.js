const getFirstHand = (socket, activeGames) => (request) => {
    console.log("Getting first hand...")
    console.log(socket)
    const { gameId, playerId } = request;
    const game = activeGames.getGame(gameId);
    console.log(game);
    const playerHand = game.gameInfo.players.getPlayer(playerId);
    socket.emit('getFirstHandResponse', playerHand)
}

module.exports = getFirstHand