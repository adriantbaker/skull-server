const joinLobby = (socket, lobby) => () => {
    socket.join('gameLobby');
    socket.emit('games', lobby.getGamesPublic())
}

module.exports = joinLobby