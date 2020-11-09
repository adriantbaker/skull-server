import { Server } from 'socket.io';
import { activeGames } from '../..';
import { CardType } from '../../utils/classes/Card/CoupCard';
import { sendGameUpdateToAll } from './helpers/sendGameUpdate';
import { sendPlayerUpdateToAll } from './helpers/sendPlayerUpdate';

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

const tryAction = (io: Server) => (request: tryActionRequest): void => {
    // TODO: validate request

    const {
        actionType, playerId, claimedCard, gameId, targetId,
    } = request;
    const game = activeGames.getOne(gameId);

    const { validRequest, turnAdvanced } = game.attempt(
        actionType,
        playerId,
        claimedCard,
        targetId,
    );

    if (validRequest) {
        // Notify players that current player attempted an action

        if (turnAdvanced) {
            // The action was immediately implemented (income)
            sendGameUpdateToAll(game, io, true);
            sendPlayerUpdateToAll(game, io);
        } else {
            // The action is not yet implemented, so no player update is needed

            if (!game.currentTurn.action) {
                console.log('Something went wrong');
                return;
            }

            const { canChallenge, canBlock } = game.currentTurn.action;

            if (canChallenge || canBlock) {
                // Set a time limit for people to challenge / block action
                /** setTimeout(
                    expireAction(io, game, game.currentAction),
                    INITIAL_ACTION_TIME_LIMIT,
                ); */
            }

            sendGameUpdateToAll(game, io);
        }
    }

    // TODO: handle if not accepted
};

export default tryAction;
