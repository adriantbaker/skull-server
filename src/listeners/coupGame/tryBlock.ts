import { Server } from 'socket.io';
import { CardType } from '../../utils/classes/Card/CoupCard';
import CoupGames from '../../utils/classes/Game/CoupGames';
import { GameUpdate } from './getGameSetup';

export enum BlockActionType {
    BlockForeignAid = 'blockForeignAid'
}

interface tryBlockRequest {
    actionId: string
    actionType: BlockActionType
    claimedCard: CardType
    gameId: string
    playerId: string
}

const tryBlock = (io: Server, activeGames: CoupGames) => (request: tryBlockRequest): void => {
    // TODO: validate request

    const {
        actionId, actionType, claimedCard, gameId, playerId,
    } = request;

    const game = activeGames.getOne(gameId);

    const blockReceived = game.block(actionId, playerId, actionType, claimedCard);

    if (blockReceived && game.currentAction && game.currentBlock) {
        // Notify players that someone has blocked the action
        const gameUpdate: GameUpdate = {
            currentTurn: null,
            currentAction: game.currentAction,
            currentBlock: game.currentBlock,
        };
        io.to(gameId).emit('gameUpdate', gameUpdate);
    }
};

export default tryBlock;
