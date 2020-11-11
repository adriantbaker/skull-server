import { Server } from 'socket.io';
import { lobby } from '../..';

interface toggleReadyRequest {
    playerId: string
    roomId: string
}

const toggleReady = (io: Server) => (
    (request: toggleReadyRequest): void => {
        const { roomId, playerId } = request;

        // Toggle player's ready status
        const room = lobby.getOne(roomId);
        room.players.getOne(playerId).toggleReady();

        // Update room
        io.to(roomId).emit('updateRoom', { players: room.players.getAllPublic() });
    }
);

export default toggleReady;
