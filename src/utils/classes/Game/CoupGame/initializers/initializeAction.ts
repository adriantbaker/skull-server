import { ActionType } from '../../../../../listeners/coupGame/tryAction';
import { BlockActionType } from '../../../../../listeners/coupGame/tryBlock';
import { CardType } from '../../../Card/CoupCard';
import CoupPlayers from '../../../Player/CoupPlayers';
import initializeAcceptedBy, { AcceptedBy } from './initializeAcceptedBy';
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
    acceptedBy: AcceptedBy,
    canChallenge: boolean,
    canBlock: boolean,
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
): Action => ({
    id: actionType + Date.now(),
    isBlock,
    isComplete: actionType === ActionType.Income,
    actionType,
    claimedCard,
    actingPlayerId: playerId,
    actingPlayerName: players.getOne(playerId).name,
    targetPlayerId: targetId,
    targetPlayerName: targetId ? players.getOne(targetId).name : undefined,
    acceptedBy: initializeAcceptedBy(players, playerId),
    canChallenge: initializeCanChallenge(actionType),
    challenged: false,
    challengeSucceeded: false,
    challengingPlayerId: undefined,
    challengingPlayerName: undefined,
    canBlock: isBlock ? false : initializeCanBlock(actionType),
    pendingActorExchange: actionType === ActionType.Exchange,
    pendingChallengeLoserDiscard: false,
    pendingTargetDiscard: actionType === ActionType.Coup,
});

export default initializeAction;
