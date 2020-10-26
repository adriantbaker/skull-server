import { Server } from 'socket.io';
import { CardType } from '../../utils/classes/Card/CoupCard';
import CoupGames from '../../utils/classes/Game/CoupGames';
import { COUNTER_ACTION_TIME_LIMIT } from '../../utils/consts/timeLimits';
import expireAction from './helpers/expireAction';
import { sendGameUpdateToAll } from './helpers/sendGameUpdate';
import { sendPlayerUpdateToAll } from './helpers/sendPlayerUpdate';

export enum BlockActionType {
    BlockForeignAid = 'blockForeignAid',
    BlockAssassinate = 'blockAssassinate',
    BlockSteal = 'blockSteal'
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
        // Set time limit for players to respond to action
        /** setTimeout(
            expireAction(io, game, game.currentBlock),
            COUNTER_ACTION_TIME_LIMIT,
        ); */

        // Notify players that someone has blocked the action
        sendPlayerUpdateToAll(game, io);
        sendGameUpdateToAll(game, io);
    }
};

export default tryBlock;
