import { Socket } from 'socket.io';
import CoupGames from '../../utils/classes/Game/CoupGames';
import { CoupPlayerPublic } from '../../utils/classes/Player/CoupPlayer';
import Rooms from '../../utils/classes/Room/Rooms';

interface GetGameExistsRequest {
    gameId: string
    playerId: string
}

interface GetGameExistsResponse {
    exists: boolean
    inGame: boolean
    ownGame: boolean
    started: boolean
    players: Array<CoupPlayerPublic>
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

        const response: GetGameExistsResponse = {
            exists: false,
            inGame: false,
            ownGame: false,
            started: false,
            players: [],
            name: '',
        };

        if (room === undefined && game === undefined) {
            sendResponse(socket, response);
            return;
        }

        response.exists = true;
        response.name = game ? game.name : room.name;
        response.started = !!game;

        const players = game ? game.players : room.players;
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
