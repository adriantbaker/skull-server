import { Socket } from 'socket.io';
import Rooms from '../../utils/classes/Room/Rooms';

const joinLobby = (socket: Socket, lobby: Rooms) => (): void => {
    socket.join('gameLobby');
    socket.emit('rooms', lobby.getAllPublic());
};

export default joinLobby;
