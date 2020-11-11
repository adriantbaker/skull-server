import { Server } from 'socket.io';
import { lobby } from '../..';
import { sendGameUpdateToAll } from './helpers/sendGameUpdate';
import { sendPlayerUpdateToAll } from './helpers/sendPlayerUpdate';

interface challengeActionRequest {
    actionId: string,
    isBlock: boolean,
    playerId: string
    gameId: string
}

const challengeAction = (io: Server) => (
    (request: challengeActionRequest): void => {
        // TODO: validate request

        const {
            actionId, playerId, gameId, isBlock,
        } = request;

        const { game } = lobby.getOne(gameId);

        if (!game) {
            console.log(`Tried to challenge action on non-existent Game ${gameId}`);
            return;
        }

        const { validRequest, turnAdvanced } = game.challenge(actionId, isBlock, playerId);

        if (validRequest) {
            // Tell all players the result of the challenge
            sendGameUpdateToAll(game, io, turnAdvanced);
            sendPlayerUpdateToAll(game, io);
        }

        // TODO: handle if not challengeed
    }
);

export default challengeAction;
