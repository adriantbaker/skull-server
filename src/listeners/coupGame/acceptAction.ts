import { Server } from 'socket.io';
import { activeGames } from '../..';
import { sendGameUpdateToAll } from './helpers/sendGameUpdate';
import { sendPlayerUpdateToAll } from './helpers/sendPlayerUpdate';

interface acceptActionRequest {
    actionId: string
    isBlock: boolean
    playerId: string
    gameId: string
}

const acceptAction = (io: Server) => (
    (request: acceptActionRequest): void => {
        // TODO: validate request

        const {
            actionId, playerId, gameId, isBlock,
        } = request;

        const game = activeGames.getOne(gameId);

        const { validRequest, turnAdvanced } = game.accept(actionId, isBlock, playerId);

        if (validRequest) {
            // Notify players that someone accepted the attempted action
            sendGameUpdateToAll(game, io, turnAdvanced);
            sendPlayerUpdateToAll(game, io);
        }

        // TODO: handle if not accepted
    }
);

export default acceptAction;
