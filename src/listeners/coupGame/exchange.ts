import { Server } from 'socket.io';
import CoupGames from '../../utils/classes/Game/CoupGames';
import { sendGameUpdateToAll } from './helpers/sendGameUpdate';
import { sendPlayerUpdateToAll } from './helpers/sendPlayerUpdate';

interface exchangeRequest {
    cardIds: Array<number>
    playerId: string
    gameId: string
}

const exchange = (io: Server, activeGames: CoupGames) => (
    (request: exchangeRequest): void => {
        // TODO: validate request

        const {
            cardIds, playerId, gameId,
        } = request;

        const game = activeGames.getOne(gameId);

        const exchangeReceived = game.exchange(playerId, cardIds);

        if (exchangeReceived) {
            sendGameUpdateToAll(game, io);
            sendPlayerUpdateToAll(game, io);
        }
    }
);

export default exchange;
