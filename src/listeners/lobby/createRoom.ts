import { Socket, Server } from 'socket.io';
import { lobby } from '../..';
import RoomMember from '../../utils/classes/RoomMember/RoomMember';

interface createRoomRequest {
    roomName: string
    ownerName: string
    ownerId: string
}

const createRoom = (io: Server, socket: Socket) => (
    (request: createRoomRequest): void => {
        const { roomName, ownerName, ownerId } = request;
        // Add room to lobby
        const owner = new RoomMember(ownerId, ownerName, true);
        const room = lobby.addRoom(roomName, owner);

        // Notify lobby and creator of new room
        io.to('gameLobby').emit('rooms', lobby.getAllPublic());
        socket.emit('createGameRoomResponse', { room: room.getPublic(), player: owner });

        // Subscribe user to room, leave lobby
        const roomId = room.id;
        socket.leave('gameLobby');
        socket.join(roomId);
    }
);

export default createRoom;
