import { Action } from '../initializers/initializeAction';

const canAdvanceTurn = (action: Action, block: Action | undefined): boolean => {
    const {
        canChallenge,
        canBlock,
        pendingActorExchange,
        pendingChallengeLoserDiscard,
        pendingTargetDiscard,
    } = action;

    // All blocks must be resolved (i.e., no current block)
    // and action must have no pending decisions
    return (!block
        && !canChallenge
        && !canBlock
        && !pendingActorExchange
        && !pendingChallengeLoserDiscard
        && !pendingTargetDiscard);
};

export default canAdvanceTurn;
