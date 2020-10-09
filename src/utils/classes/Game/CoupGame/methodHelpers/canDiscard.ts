import { Action } from '../initializers/initializeAction';

export interface CanDiscard {
    playerCanDiscard: boolean
    targetPlayerDiscard: boolean
}

const canDiscard = (playerId: string, action: Action): CanDiscard => {
    let targetPlayerDiscard = false;

    const { pendingChallengeLoserDiscard, pendingTargetDiscard } = action;
    if (pendingChallengeLoserDiscard) {
        const { challengeSucceeded, actingPlayerId, challengingPlayerId } = action;
        const challengeLoserId = challengeSucceeded ? actingPlayerId : challengingPlayerId;
        if (playerId !== challengeLoserId) {
            // This player should not be discarding right now
            return {
                playerCanDiscard: false,
                targetPlayerDiscard,
            };
        }
    } else if (pendingTargetDiscard) {
        targetPlayerDiscard = true;
        const { targetPlayerId } = action;
        if (playerId !== targetPlayerId) {
            // This player should not be discarding right now
            return {
                playerCanDiscard: false,
                targetPlayerDiscard,
            };
        }
    } else {
        // No pending discards
        return {
            playerCanDiscard: false,
            targetPlayerDiscard,
        };
    }

    // Someone needs to discard and the playerId matches the person who needs to discard
    return {
        playerCanDiscard: true,
        targetPlayerDiscard,
    };
};

export default canDiscard;
