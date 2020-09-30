const leaveLobby = (socket) => () => {
    socket.leave('lobby');
};

module.exports = leaveLobby;
