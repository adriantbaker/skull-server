const joinLobby = (socket, lobby) => () => {
    socket.join('gameLobby');
    console.log('Sending games');
    console.log(lobby.getGamesPublic());
    socket.emit('games', lobby.getGamesPublic());
};

module.exports = joinLobby;
