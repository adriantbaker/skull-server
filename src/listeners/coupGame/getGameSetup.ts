import { Socket } from 'socket.io';
import CoupGames from '../../utils/classes/Game/CoupGames';
import { sendGameUpdateToOne } from './helpers/sendGameUpdate';
import { sendPlayerUpdateBySocket } from './helpers/sendPlayerUpdate';

interface GetGameSetupRequest {
    gameId: string
    playerId: string
}

const getGameSetup = (socket: Socket, activeGames: CoupGames) => (
    (request: GetGameSetupRequest): void => {
        const { gameId, playerId } = request;
        const game = activeGames.getOne(gameId);

        // Inform player of initial game setup
        sendGameUpdateToOne(game, socket);
        sendPlayerUpdateBySocket(playerId, game, socket);

        // Add player to a unique room for private updates
        socket.join(playerId);
    }
);

export default getGameSetup;
