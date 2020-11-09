import { Server } from 'socket.io';
import { activeGames } from '../..';
import { CardType } from '../../utils/classes/Card/CoupCard';
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

const tryBlock = (io: Server) => (request: tryBlockRequest): void => {
    // TODO: validate request

    const {
        actionId, actionType, claimedCard, gameId, playerId,
    } = request;

    const game = activeGames.getOne(gameId);

    const { validRequest, turnAdvanced } = game.block(actionId, playerId, actionType, claimedCard);

    if (validRequest) { // && game.currentTurn.action && game.currentTurn.block
        // Set time limit for players to respond to action
        /** setTimeout(
            expireAction(io, game, game.currentBlock),
            COUNTER_ACTION_TIME_LIMIT,
        ); */

        // Notify players that someone has blocked the action
        sendGameUpdateToAll(game, io, turnAdvanced);
        sendPlayerUpdateToAll(game, io);
    }
};

export default tryBlock;
