import { Socket } from 'socket.io';
import { lobby } from '../..';
import { sendGameConfigToOne } from './helpers/sendGameConfig';
import { sendGameUpdateToOne } from './helpers/sendGameUpdate';
import { sendPlayerUpdateBySocket } from './helpers/sendPlayerUpdate';

interface GetGameSetupRequest {
    gameId: string
    playerId: string
}

const getGameSetup = (socket: Socket) => (
    (request: GetGameSetupRequest): void => {
        const { gameId, playerId } = request;

        const { game, gameIsActive } = lobby.getOne(gameId);

        if (!game || !gameIsActive) {
            console.log(`Tried to get game setup on non-existent Game ${gameId}`);
            return;
        }

        // Inform player of initial game setup
        sendGameConfigToOne(game, socket);
        sendGameUpdateToOne(game, socket);
        sendPlayerUpdateBySocket(playerId, game, socket);

        // Add player to a unique room for private updates
        socket.join(playerId);
    }
);

export default getGameSetup;
