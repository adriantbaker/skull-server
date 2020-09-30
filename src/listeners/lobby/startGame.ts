import { Server } from 'socket.io';
import CoupGame from '../../utils/classes/Game/CoupGame';
import CoupGames from '../../utils/classes/Game/CoupGames';
import Rooms from '../../utils/classes/Room/Rooms';

interface startRoomRequest {
    roomId: string
}

const startGame = (io: Server, lobby: Rooms, activeGames: CoupGames) => (
    (request: startRoomRequest) => {
        const { roomId } = request;

        // Remove room from lobby
        const room = lobby.removeRoom(roomId);
        const remainingRooms = lobby.getAllPublic();
        io.to('roomLobby').emit('rooms', remainingRooms);

        // Create game from room
        const game = new CoupGame(room.name, room.owner);
        activeGames.addGame(game);

        game.startGame();

        // Tell each player the game has started
        io.to(roomId).emit('startGame');
    }
);

module.exports = startGame;
