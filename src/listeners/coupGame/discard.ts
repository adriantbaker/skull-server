import { Server } from 'socket.io';
import CoupGames from '../../utils/classes/Game/CoupGames';
import { sendGameUpdateToAll } from './helpers/sendGameUpdate';
import { sendPlayerUpdateToAll } from './helpers/sendPlayerUpdate';

interface discardRequest {
    cardIds: Array<number>
    playerId: string
    gameId: string
}

const discard = (io: Server, activeGames: CoupGames) => (
    (request: discardRequest): void => {
        // TODO: validate request

        const {
            cardIds, playerId, gameId,
        } = request;

        const game = activeGames.getOne(gameId);

        const discardReceived = game.discard(playerId, cardIds);

        if (discardReceived) {
            sendGameUpdateToAll(game, io);
            sendPlayerUpdateToAll(game, io);
        }
    }
);

export default discard;
