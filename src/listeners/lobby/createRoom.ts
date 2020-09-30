import { Socket, Server } from 'socket.io';
import CoupPlayer from '../../utils/classes/Player/CoupPlayer';
import Room from '../../utils/classes/Room/Room';
import Rooms from '../../utils/classes/Room/Rooms';

interface createRoomRequest {
    roomName: string,
    ownerName: string
}

const createRoom = (io: Server, socket: Socket, lobby: Rooms) => (
    (request: createRoomRequest): void => {
        const { roomName, ownerName } = request;
        // Add room to lobby
        const owner = new CoupPlayer(socket.id, ownerName, true);
        const room = new Room(roomName, owner);
        lobby.addRoom(room);

        // Notify lobby and creator of new room
        io.to('gameLobby').emit('games', lobby.getAllPublic());
        socket.emit('createRoomResponse', { room: room.getPublic(), player: owner });

        // Subscribe user to room, leave lobby
        const roomId = room.id;
        socket.leave('gameLobby');
        socket.join(roomId);
    }
);

export default createRoom;
