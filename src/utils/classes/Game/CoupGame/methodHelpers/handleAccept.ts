import targetActionNeeded from '../../../../../listeners/coupGame/helpers/targetActionNeeded';
import CoupPlayers from '../../../Player/CoupPlayers';
import { Action } from '../initializers/initializeAction';
import isAcceptedByAll from './isAcceptedByAll';

const handleAccept = (
    actionId: string,
    currentActionOrBlock: Action | undefined,
    playerId: string,
    players: CoupPlayers,
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

    const { actionType, targetPlayerId } = currentActionOrBlock;

    let numTargetCards = 0;
    if (targetPlayerId) {
        numTargetCards = players.getOne(targetPlayerId).cards.length;
    }

    // Target must discard only if the action is resolved
    // and they didn't already lose their last card earlier in the turn
    const pendingTargetDiscard = acceptedByAll
        && targetActionNeeded(actionType)
        && numTargetCards > 0;

    const newActionOrBlock = {
        ...currentActionOrBlock,
        acceptedBy: newAcceptedBy,
        canChallenge: currentActionOrBlock.canChallenge && !acceptedByAll,
        canBlock: currentActionOrBlock.canBlock && !acceptedByAll,
        pendingTargetDiscard,
    };

    return newActionOrBlock;
};

export default handleAccept;
