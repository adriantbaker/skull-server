import { Server, Socket } from 'socket.io';
import CoupPlayer from '../../utils/classes/Player/CoupPlayer';
import Rooms from '../../utils/classes/Room/Rooms';

interface joinRoomRequest {
    roomId: string
    playerName: string
}

const joinRoom = (io: Server, socket: Socket, lobby: Rooms) => (
    (request: joinRoomRequest): void => {
        const { roomId, playerName } = request;

        // Add user to room
        const room = lobby.getOne(roomId);
        const player = new CoupPlayer(socket.id, playerName);
        room.addPlayer(player);

        // Notify joiner of successful join
        socket.emit('joinGameRoomResponse', { room: room.getPublic(), player });

        // Notify lobby and game room that player joined
        io.to('gameLobby').emit('rooms', lobby.getAllPublic());
        io.to(roomId).emit('updateRoom', { players: room.players.getAllPublic() });

        // Subscribe user to room room, leave lobby
        socket.leave('gameLobby');
        socket.join(roomId);
    }
);

export default joinRoom;
