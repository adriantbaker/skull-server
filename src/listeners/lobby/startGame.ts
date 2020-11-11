import { Server } from 'socket.io';
import { lobby } from '../..';

interface startRoomRequest {
    roomId: string
}

const startGame = (io: Server) => (
    (request: startRoomRequest): void => {
        const { roomId } = request;

        // Start game within room
        const room = lobby.getOne(roomId);
        room.startGame();

        // Hide in-progress game from lobby
        const remainingRooms = lobby.getAllPublic();
        io.to('roomLobby').emit('rooms', remainingRooms);

        // Tell each player the game has started
        io.to(roomId).emit('startGame');
    }
);

export default startGame;
