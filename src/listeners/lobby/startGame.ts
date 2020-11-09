import { Server } from 'socket.io';
import { activeGames, lobby } from '../..';
import CoupGame from '../../utils/classes/Game/CoupGame/CoupGame';

interface startRoomRequest {
    roomId: string
}

const startGame = (io: Server) => (
    (request: startRoomRequest): void => {
        const { roomId } = request;

        // Remove room from lobby
        const room = lobby.removeRoom(roomId);
        const remainingRooms = lobby.getAllPublic();
        io.to('roomLobby').emit('rooms', remainingRooms);

        // Create game from room
        const game = new CoupGame(room.name, room.players, room.id);
        activeGames.addGame(game);

        game.startGame();

        // Tell each player the game has started
        io.to(roomId).emit('startGame');
    }
);

export default startGame;
