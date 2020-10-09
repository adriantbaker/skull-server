import { Action } from '../initializers/initializeAction';

const handleDiscard = (action: Action, targetDiscard: boolean): Action => ({
    ...action,
    pendingChallengeLoserDiscard: targetDiscard ? action.pendingChallengeLoserDiscard : false,
    pendingTargetDiscard: targetDiscard ? false : action.pendingTargetDiscard,
});

export default handleDiscard;
