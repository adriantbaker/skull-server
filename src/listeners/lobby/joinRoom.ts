import { Server, Socket } from 'socket.io';
import { lobby } from '../..';
import CoupPlayer from '../../utils/classes/Player/CoupPlayer';
import RoomMember from '../../utils/classes/RoomMember/RoomMember';

interface joinRoomRequest {
    roomId: string
    playerName: string
    playerId: string
}

const joinRoom = (io: Server, socket: Socket) => (
    (request: joinRoomRequest): void => {
        const { roomId, playerName, playerId } = request;

        // Add user to room
        const room = lobby.getOne(roomId);
        const player = new RoomMember(playerId, playerName);
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
