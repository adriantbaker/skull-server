import { Server } from 'socket.io';
import { lobby } from '../..';

interface deleteRoomRequest {
    roomId: string
}

const deleteRoom = (io: Server) => (
    (request: deleteRoomRequest): void => {
        const { roomId } = request;

        lobby.removeRoom(roomId);

        // Notify lobby of removed room
        io.to('gameLobby').emit('rooms', lobby.getAllPublic());

        // Unsubscribe all room members from room, subscribe them to lobby
        io.in(roomId).clients((err: Error | undefined, socketIds: Array<string>) => {
            if (err) {
                console.log(`Error: ${err}`);
                return;
            }
            socketIds.forEach((socketId) => {
                const socket = io.sockets.connected[socketId];
                socket.emit('gameRoomDeleted');
                socket.leave(roomId);
                socket.join('gameLobby');
            });
        });
    }
);

export default deleteRoom;
