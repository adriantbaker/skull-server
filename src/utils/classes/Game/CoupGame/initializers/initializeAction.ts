import { ActionType } from '../../../../../listeners/coupGame/tryAction';
import { BlockActionType } from '../../../../../listeners/coupGame/tryBlock';
import { CardType } from '../../../Card/CoupCard';
import CoupPlayers from '../../../Player/CoupPlayers';
import initializeInputByPlayers, { InputByPlayers } from './initializeInputByPlayers';
import initializeCanBlock from './initializeCanBlock';
import initializeCanChallenge from './initializeCanChallenge';

export interface Action {
    id: string,
    isBlock: boolean,
    isComplete: boolean,
    actionType: ActionType | BlockActionType,
    claimedCard: CardType | undefined,
    actingPlayerId: string,
    actingPlayerName: string,
    targetPlayerId: string | undefined,
    targetPlayerName: string | undefined,
    acceptedBy: InputByPlayers,
    canChallenge: boolean,
    canBlock: boolean,
    blockedBy: InputByPlayers,
    challenged: boolean,
    challengeSucceeded: boolean,
    challengingPlayerId: string | undefined,
    challengingPlayerName: string | undefined,
    pendingChallengeLoserDiscard: boolean,
    pendingTargetDiscard: boolean,
    pendingActorExchange: boolean,
}

const initializeAction = (
    isBlock: boolean,
    players: CoupPlayers,
    actionType: ActionType | BlockActionType,
    playerId: string,
    claimedCard?: CardType,
    targetId?: string,
): Action => {
    const inputByPlayers = initializeInputByPlayers(players, playerId);
    return {
        id: actionType + Date.now(),
        isBlock,
        isComplete: actionType === ActionType.Income,
        actionType,
        claimedCard,
        actingPlayerId: playerId,
        actingPlayerName: players.getOne(playerId).name,
        targetPlayerId: targetId,
        targetPlayerName: targetId ? players.getOne(targetId).name : undefined,
        acceptedBy: inputByPlayers,
        canChallenge: initializeCanChallenge(actionType),
        challenged: false,
        challengeSucceeded: false,
        challengingPlayerId: undefined,
        challengingPlayerName: undefined,
        canBlock: isBlock ? false : initializeCanBlock(actionType),
        blockedBy: inputByPlayers,
        pendingActorExchange: actionType === ActionType.Exchange,
        pendingChallengeLoserDiscard: false,
        pendingTargetDiscard: actionType === ActionType.Coup,
    };
};

export default initializeAction;
