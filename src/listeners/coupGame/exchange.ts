import { Server } from 'socket.io';
import { lobby } from '../..';
import { sendGameUpdateToAll } from './helpers/sendGameUpdate';
import { sendPlayerUpdateToAll } from './helpers/sendPlayerUpdate';

interface exchangeRequest {
    cardIds: Array<number>
    playerId: string
    gameId: string
}

const exchange = (io: Server) => (
    (request: exchangeRequest): void => {
        // TODO: validate request

        const {
            cardIds, playerId, gameId,
        } = request;

        const { game } = lobby.getOne(gameId);

        if (!game) {
            console.log(`Tried to exchange on non-existent Game ${gameId}`);
            return;
        }

        const { validRequest, turnAdvanced } = game.exchange(playerId, cardIds);

        if (validRequest) {
            sendGameUpdateToAll(game, io, turnAdvanced);
            sendPlayerUpdateToAll(game, io);
        }
    }
);

export default exchange;
