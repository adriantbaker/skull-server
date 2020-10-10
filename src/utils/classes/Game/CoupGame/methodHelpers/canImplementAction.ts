import { Action } from '../initializers/initializeAction';

const canImplementAction = (action: Action): boolean => {
    const {
        canChallenge,
        canBlock,
        pendingChallengeLoserDiscard,
        pendingTargetDiscard,
    } = action;

    return (!(canChallenge
        || canBlock
        || pendingChallengeLoserDiscard
        || pendingTargetDiscard));
};

export default canImplementAction;
