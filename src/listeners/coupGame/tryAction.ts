import { Server } from 'socket.io';
import { CardType } from '../../utils/classes/Card/CoupCard';
import CoupGames from '../../utils/classes/Game/CoupGames';
import { GameUpdate } from './getGameSetup';

export enum ActionType {
    Income = 'income',
    ForeignAid = 'foreignAid',
    Coup = 'coup',
    Tax = 'tax',
    Assassinate = 'assassinate',
    Steal = 'steal',
    Exchange = 'exchange'
}

interface tryActionRequest {
    actionType: ActionType
    claimedCard: CardType | undefined
    targetId: string | undefined
    gameId: string
    playerId: string
}

const tryAction = (io: Server, activeGames: CoupGames) => (request: tryActionRequest): void => {
    // TODO: validate request

    const {
        actionType, playerId, claimedCard, gameId, targetId,
    } = request;
    const game = activeGames.getOne(gameId);

    const tryReceived = game.attempt(actionType, playerId, claimedCard, targetId);

    if (tryReceived && game.currentAction) {
        // Notify players that current player is attempting an action
        const gameUpdate: GameUpdate = {
            currentTurn: null,
            currentAction: game.currentAction,
            currentBlock: null,
        };
        io.to(gameId).emit('gameUpdate', gameUpdate);
    }

    // TODO: handle if not accepted
};

export default tryAction;
