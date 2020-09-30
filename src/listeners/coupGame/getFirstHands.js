const getFirstHands = (socket, activeGames) => (request) => {
    console.log('Getting first hand...');
    console.log(socket);
    const { gameId, playerId } = request;
    const game = activeGames.getGame(gameId);
    console.log(game);
    const playerHand = game.gameInfo.players.getPlayer(playerId);
    const opponentHands = game.gameInfo.players.getOpponentsPublic(playerId);
    socket.emit('getFirstHandsResponse', { playerHand, opponentHands });
};

module.exports = getFirstHands;
