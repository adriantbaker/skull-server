import { Socket } from 'socket.io';
import { lobby } from '../..';
import RoomMember from '../../utils/classes/RoomMember/RoomMember';

interface GetGameExistsRequest {
    gameId: string
    playerId: string
}

interface GetGameExistsResponse {
    exists: boolean
    inGame: boolean
    ownGame: boolean
    started: boolean
    players: Array<RoomMember>
    name: string
}

const sendResponse = (socket: Socket, response: GetGameExistsResponse): void => {
    socket.emit('getGameExistsResponse', response);
};

const getGameExists = (socket: Socket) => (
    (request: GetGameExistsRequest): void => {
        const { gameId, playerId } = request;
        const room = lobby.getOne(gameId);

        const response: GetGameExistsResponse = {
            exists: false,
            inGame: false,
            ownGame: false,
            started: false,
            players: [],
            name: '',
        };

        if (room === undefined) {
            sendResponse(socket, response);
            return;
        }

        response.exists = true;
        response.name = room.name;
        response.started = room.gameIsActive;

        const { players } = room;
        const player = players.getOne(playerId);

        response.players = players.getAllPublic();

        if (player === undefined) {
            sendResponse(socket, response);
            return;
        }

        response.inGame = true;
        response.ownGame = player.isOwner;

        socket.join(gameId);
        sendResponse(socket, response);
    }
);

export default getGameExists;
