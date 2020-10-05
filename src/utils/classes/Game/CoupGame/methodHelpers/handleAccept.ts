import { Action } from '../initializers/initializeAction';

const handleAccept = (
    actionId: string,
    currentActionOrBlock: Action | undefined,
    playerId: string,
): Action | undefined => {
    if (!currentActionOrBlock
            || !currentActionOrBlock.canChallenge
            || !currentActionOrBlock.claimedCard
            || currentActionOrBlock.id !== actionId) {
        // Trying to accept a stale action or an action that
        // does not need to be accepted (income / foreign aid / coup)
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

    const acceptedByAll = Object.values(newAcceptedBy).every((val) => val === true);

    const newActionOrBlock = {
        ...currentActionOrBlock,
        acceptedBy: newAcceptedBy,
        canChallenge: !acceptedByAll,
        canBlock: !acceptedByAll,
    };

    return newActionOrBlock;
};

export default handleAccept;
