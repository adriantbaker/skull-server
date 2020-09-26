const joinLobby = (socket, lobby) => () => {
    socket.join('gameLobby');
    socket.emit('games', lobby.getGames())
}

module.exports = joinLobby