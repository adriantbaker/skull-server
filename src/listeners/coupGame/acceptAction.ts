import { Server } from 'socket.io';
import CoupGames from '../../utils/classes/Game/CoupGames';
import { sendGameUpdateToAll } from './helpers/sendGameUpdate';
import { sendPlayerUpdateToAll } from './helpers/sendPlayerUpdate';

interface acceptActionRequest {
    actionId: string
    isBlock: boolean
    playerId: string
    gameId: string
}

const acceptAction = (io: Server, activeGames: CoupGames) => (
    (request: acceptActionRequest): void => {
        // TODO: validate request

        const {
            actionId, playerId, gameId, isBlock,
        } = request;

        const game = activeGames.getOne(gameId);

        const acceptReceived = game.accept(actionId, isBlock, playerId);

        if (acceptReceived) {
            // Notify players that someone accepted the attempted action
            sendGameUpdateToAll(game, io);
            sendPlayerUpdateToAll(game, io);
        }

        // TODO: handle if not accepted
    }
);

export default acceptAction;
