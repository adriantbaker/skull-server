import { Socket } from 'socket.io';
import CoupGames from '../../utils/classes/Game/CoupGames';
import Rooms from '../../utils/classes/Room/Rooms';
import findPlayerInGameOrRoom from './helpers/findPlayerInGameOrRoom';

interface GetGameExistsRequest {
    gameId: string
    playerId: string
}

interface GetGameExistsResponse {
    exists: boolean
    inGame: boolean
    ownGame: boolean
    started: boolean
    name: string
}

const sendResponse = (socket: Socket, response: GetGameExistsResponse): void => {
    socket.emit('getGameExistsResponse', response);
};

const getGameExists = (socket: Socket, lobby: Rooms, activeGames: CoupGames) => (
    (request: GetGameExistsRequest): void => {
        const { gameId, playerId } = request;
        const room = lobby.getOne(gameId);
        const game = activeGames.getOne(gameId);

        const response = {
            exists: false,
            inGame: false,
            ownGame: false,
            started: false,
            name: '',
        };

        if (room === undefined && game === undefined) {
            sendResponse(socket, response);
            return;
        }

        response.exists = true;
        response.name = game ? game.name : room.name;

        const player = findPlayerInGameOrRoom(playerId, game || room);

        if (player === undefined) {
            sendResponse(socket, response);
            return;
        }

        response.inGame = true;
        response.ownGame = player.isOwner;
        response.started = !!game;

        socket.join(gameId);
        sendResponse(socket, response);
    }
);

export default getGameExists;
