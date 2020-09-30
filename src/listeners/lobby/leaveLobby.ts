import { Socket } from 'socket.io';

const leaveLobby = (socket: Socket) => (): void => {
    socket.leave('lobby');
};

export default leaveLobby;
