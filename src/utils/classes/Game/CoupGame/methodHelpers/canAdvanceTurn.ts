import { Action } from '../initializers/initializeAction';

const canAdvanceTurn = (action: Action): boolean => {
    const {
        canChallenge,
        canBlock,
        pendingActorExchange,
        pendingChallengeLoserDiscard,
        pendingTargetDiscard,
    } = action;

    return (!canChallenge
        && !canBlock
        && !pendingActorExchange
        && !pendingChallengeLoserDiscard
        && !pendingTargetDiscard);
};

export default canAdvanceTurn;
