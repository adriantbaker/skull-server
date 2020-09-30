import { Socket } from 'socket.io';

const leaveLobby = (socket: Socket) => () => {
    socket.leave('lobby');
};

module.exports = leaveLobby;
