import { Server, Socket } from 'socket.io';
import { lobby } from '../..';

interface leaveRoomRequest {
    roomId: string
    playerId: string
}

const leaveRoom = (io: Server, socket: Socket) => (
    (request: leaveRoomRequest): void => {
        const { roomId, playerId } = request;

        // Remove user from room
        const room = lobby.getOne(roomId);
        room.removePlayer(playerId);

        // Notify leaveer of successful leave
        socket.emit('leaveGameRoomResponse');

        // Notify lobby and game room that player left
        io.to('gameLobby').emit('rooms', lobby.getAllPublic());
        io.to(roomId).emit('updateRoom', { players: room.players.getAllPublic() });

        // Unsubscribe user from room, subscribe to lobby
        socket.join('gameLobby');
        socket.leave(roomId);
    }
);

export default leaveRoom;
