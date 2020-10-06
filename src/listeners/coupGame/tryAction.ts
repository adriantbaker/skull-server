import { Server } from 'socket.io';
import { CardType } from '../../utils/classes/Card/CoupCard';
import CoupGames from '../../utils/classes/Game/CoupGames';
import { INITIAL_ACTION_TIME_LIMIT } from '../../utils/consts/timeLimits';
import expireAction from './helpers/expireAction';
import { sendGameUpdateToAll } from './helpers/sendGameUpdate';

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

        const { canChallenge, canBlock } = game.currentAction;

        if (canChallenge || canBlock) {
            // Set a time limit for people to challenge / block action
            setTimeout(
                expireAction(io, game, game.currentAction),
                INITIAL_ACTION_TIME_LIMIT,
            );
        }

        sendGameUpdateToAll(game, io);
    }

    // TODO: handle if not accepted
};

export default tryAction;
