import { Server } from 'socket.io';
import CoupGames from '../../utils/classes/Game/CoupGames';
import { GameUpdate } from './getGameSetup';

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

        if (acceptReceived && game.currentAction) {
            // Notify players that someone accepted the attempted action
            const gameUpdate: GameUpdate = {
                currentTurn: null,
                currentAction: game.currentAction,
                currentBlock: null,
            };
            io.to(gameId).emit('gameUpdate', gameUpdate);
        }

        // TODO: handle if not accepted
    }
);

export default acceptAction;
