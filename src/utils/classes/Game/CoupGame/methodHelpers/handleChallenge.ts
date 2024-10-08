import CoupDeck from '../../../Deck/CoupDeck';
import CoupPlayers from '../../../Player/CoupPlayers';
import { Action } from '../initializers/initializeAction';

const handleChallenge = (
    actionId: string,
    currentActionOrBlock: Action | undefined,
    challengingPlayerId: string,
    players: CoupPlayers,
    deck: CoupDeck,
): Action | undefined => {
    if (!currentActionOrBlock
        || !currentActionOrBlock.canChallenge
        || !currentActionOrBlock.claimedCard
        || currentActionOrBlock.id !== actionId) {
        // Trying to challenge a stale action or an action that
        // cannot be challenged (income / foreign aid / coup)
        return undefined;
    }

    if (currentActionOrBlock.acceptedBy[challengingPlayerId]) {
        // Can't challenge the action after accepting it
        return undefined;
    }

    // The challenge is valid - this means no one else can challenge
    const challengeEffects = {
        canChallenge: false,
        challenged: true,
        challengingPlayerId,
        challengingPlayerName: players.getOne(challengingPlayerId).name,
        pendingChallengeLoserDiscard: true,
    };

    // Check if the challenged player is bluffing
    const { claimedCard, actingPlayerId, targetPlayerId } = currentActionOrBlock;
    const actingPlayer = players.getOne(actingPlayerId);
    const actingPlayerCard = actingPlayer.searchForCardOfType(claimedCard);

    if (actingPlayerCard === undefined) {
        // Challenger was successful
        const newActionOrBlock = {
            ...currentActionOrBlock,
            ...challengeEffects,
            pendingActorExchange: false,
            canBlock: false,
            challengeSucceeded: true,
        };

        return newActionOrBlock;
    }

    // Else - challenger was unsuccessful
    const newActionOrBlock = {
        ...currentActionOrBlock,
        ...challengeEffects,
        challengeSucceeded: false,
    };

    if (challengingPlayerId === targetPlayerId) {
        const challengeLoser = players.getOne(challengingPlayerId);
        const numChallengeLoserCards = challengeLoser.cards.length;
        if (numChallengeLoserCards === 1) {
            // After the challenge loser discards, they will be eliminated
            // Thus, there is no need / way to block the action against them
            newActionOrBlock.canBlock = false;
        }
    }

    // Player who was wrongly challenged trades their card for a new one
    const removedCard = actingPlayer.removeCard(actingPlayerCard.id);
    deck.insert([removedCard]);
    const newCard = deck.drawOne();
    actingPlayer.addCards([newCard]);

    return newActionOrBlock;
};

export default handleChallenge;
