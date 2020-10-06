import targetActionNeeded from '../../../../../listeners/coupGame/helpers/targetActionNeeded';
import { ActionType } from '../../../../../listeners/coupGame/tryAction';
import { Action } from '../initializers/initializeAction';
import isAcceptedByAll from './isAcceptedByAll';

const handleAccept = (
    actionId: string,
    currentActionOrBlock: Action | undefined,
    playerId: string,
): Action | undefined => {
    if (!currentActionOrBlock
            || !(currentActionOrBlock.canChallenge || currentActionOrBlock.canBlock)
            || currentActionOrBlock.id !== actionId) {
        // Trying to accept a stale action or an action that
        // does not need to be accepted (income / coup)
        return undefined;
    }
    if (currentActionOrBlock.acceptedBy[playerId]) {
        // Already accepted the action
        return undefined;
    }

    // Record the player's acceptance of the action
    const newAcceptedBy = {
        ...currentActionOrBlock.acceptedBy,
        [playerId]: true,
    };

    const acceptedByAll = isAcceptedByAll(newAcceptedBy);

    const { actionType } = currentActionOrBlock;

    const newActionOrBlock = {
        ...currentActionOrBlock,
        acceptedBy: newAcceptedBy,
        canChallenge: !acceptedByAll,
        canBlock: !acceptedByAll,
        pendingTargetDiscard: targetActionNeeded(actionType),
    };

    return newActionOrBlock;
};

export default handleAccept;
