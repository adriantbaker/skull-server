import { Socket } from 'socket.io';
import { lobby } from '../..';

const joinLobby = (socket: Socket) => (): void => {
    socket.join('gameLobby');
    socket.emit('rooms', lobby.getAllPublic());
};

export default joinLobby;
