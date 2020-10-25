import { ActionType } from '../../../../listeners/coupGame/tryAction';
import { BlockActionType } from '../../../../listeners/coupGame/tryBlock';
import { ChallengeOutcome } from '../../../interfaces/signals';
import CoupCard, { CardType } from '../../Card/CoupCard';
import Deck, { Hand } from '../../Deck/CoupDeck';
import CoupPlayer, { CoupPlayerPublic } from '../../Player/CoupPlayer';
import CoupPlayers from '../../Player/CoupPlayers';
import deckCardTypes from '../deckCardTypes';
import initializeAction, { Action } from './initializers/initializeAction';
import canImplementAction from './methodHelpers/canImplementAction';
import canDiscard from './methodHelpers/canDiscard';
import handleAccept from './methodHelpers/handleAccept';
import handleChallenge from './methodHelpers/handleChallenge';
import handleDiscard from './methodHelpers/handleDiscard';
import handleExpireAction from './methodHelpers/handleExpireAction';
import isAcceptedByAll from './methodHelpers/isAcceptedByAll';
import canAdvanceTurn from './methodHelpers/canAdvanceTurn';
import isAcceptedOrBlockedByAll from './methodHelpers/isAcceptedOrBlockedByAll';

export interface AttemptOutcome {
    received: boolean
    implemented: boolean
}

export interface Turn {
    number: number
    playerId: string
    playerName: string
}

export interface CoupGamePublic {
    id: string,
    owner: CoupPlayerPublic
    name: string
    players: Array<CoupPlayerPublic>
    started: boolean
    currentTurn: Turn
    currentAction: Action | undefined
    currentBlock: Action | undefined
    pastBlocks: Array<Action>
    deck: Deck
    won: boolean
    winnerId: string
    winnerName: string
}

class CoupGame {
    id: string
    owner: CoupPlayer
    name: string
    players: CoupPlayers
    numPlayers: number
    started: boolean
    currentTurn: Turn
    currentAction: Action | undefined
    currentBlock: Action | undefined
    pastBlocks: Array<Action>
    deck: Deck
    won: boolean
    winnerId: string
    winnerName: string

    /**
     *
     * @param name Game name
     * @param players All players, including the owner
     * @param id Can instantiate Game ID to be same as Room ID
     */
    constructor(name: string, players: CoupPlayers, id?: string) {
        const owner = players.getAll().filter((player) => player.isOwner)[0];

        this.id = id || owner.id + name + Date.now();
        this.owner = owner;
        this.name = name;
        this.players = players;
        this.numPlayers = players.getNumPlayers();
        this.started = false;
        this.currentTurn = {
            number: -1,
            playerId: '',
            playerName: '',
        };
        this.currentAction = undefined;
        this.currentBlock = undefined;
        this.pastBlocks = [];
        this.won = false;
        this.winnerId = '';
        this.winnerName = '';

        // Initialize Coup deck
        const deckCards: Array<CoupCard> = [];
        let numCardsPushed = 0;
        deckCardTypes.forEach((type) => {
            for (let i = 0; i < type.count; i++) {
                deckCards.push(new CoupCard(type.name, numCardsPushed));
                numCardsPushed += 1;
            }
        });

        this.deck = new Deck(deckCards);
    }

    addPlayer(player: CoupPlayer): void {
        this.players.addPlayer(player);
    }

    removePlayer(playerId: string): CoupPlayer {
        return this.players.removePlayer(playerId);
    }

    startGame(): void {
        // Randomly assign turn order
        this.players.assignTurnOrder();

        // Deal 2 Coup cards to each player
        const numPlayers = this.players.getNumPlayers();
        const hands = this.deck.deal(2, numPlayers);
        this.players.dealToAll(hands);

        // Signal game has started
        this.started = true;
        this.tryNextTurn();
    }

    tryNextTurn(): void {
        if (this.currentAction && !canAdvanceTurn(this.currentAction, this.currentBlock)) {
            // Still some pending player action (block / discard / exchange)
            return;
        }

        this.currentAction = undefined;
        this.currentBlock = undefined;
        this.pastBlocks = [];

        const activePlayerIds = this.players.getActivePlayerIds();

        if (activePlayerIds.length === 0) {
            // Something has gone wrong
            return;
        }

        if (activePlayerIds.length === 1) {
            // Everyone else has been eliminated; we have a winner
            const [winnerId] = activePlayerIds;

            this.currentTurn = {
                number: -1,
                playerId: '',
                playerName: '',
            };
            this.won = true;
            this.winnerId = winnerId;
            this.winnerName = this.players.getOne(winnerId).name;

            return;
        }

        let nextTurnNumber = (this.currentTurn.number + 1) % this.numPlayers;
        let nextTurnPlayerId = this.players.turnOrder[nextTurnNumber];
        while (!activePlayerIds.includes(nextTurnPlayerId)) {
            nextTurnNumber = (nextTurnNumber + 1) % this.numPlayers;
            nextTurnPlayerId = (this.players.turnOrder[nextTurnNumber]);
        }

        const nextTurnPlayer = this.players.getOne(nextTurnPlayerId);
        const nextTurnPlayerName = nextTurnPlayer.name;

        this.currentTurn = {
            number: nextTurnNumber,
            playerId: nextTurnPlayerId,
            playerName: nextTurnPlayerName,
        };
    }

    attempt(
        actionType: ActionType,
        playerId: string,
        claimedCard?: CardType,
        targetId?: string,
    ): AttemptOutcome {
        if (this.currentAction !== undefined) {
            // An action has already been declared
            return {
                received: false,
                implemented: false,
            };
        }

        // Set action
        this.currentAction = initializeAction(
            false,
            this.players,
            actionType,
            playerId,
            claimedCard,
            targetId,
        );

        const implemented = this.tryToImplementAction();

        return {
            received: true,
            implemented,
        };
    }

    accept(actionId: string, isBlock: boolean, playerId: string): boolean {
        const action = isBlock ? this.currentBlock : this.currentAction;
        const updatedAction = handleAccept(actionId, action, playerId, this.players);
        if (!updatedAction) {
            // The player was unable to accept the action
            return false;
        }
        // The action must be updated
        if (isBlock) {
            if (!this.currentAction) {
                // Trying to accept a block when no action exists
                return false;
            }

            this.currentBlock = updatedAction;
            // If everyone has accepted the block, it is resolved
            const acceptedByAll = isAcceptedByAll(updatedAction.acceptedBy, this.players);
            if (acceptedByAll) {
                this.currentAction.canBlock = false;
                this.pastBlocks.push(this.currentBlock);
                this.currentBlock = undefined;
            }
            this.tryNextTurn();
        } else {
            this.currentAction = updatedAction;
            this.tryToChargeForAction();
            this.tryToImplementAction();
        }

        return true;
    }

    challenge(
        actionId: string,
        isBlock: boolean,
        challengingPlayerId: string,
    ): ChallengeOutcome | undefined {
        if (!this.currentAction || (isBlock && !this.currentBlock)) {
            return undefined;
        }

        const action = isBlock ? this.currentBlock : this.currentAction;

        const updatedAction = handleChallenge(
            actionId, action, challengingPlayerId, this.players, this.deck,
        );

        if (!updatedAction) {
            // The player was unable to challenge the action
            return undefined;
        }

        // The action must be updated
        if (isBlock) {
            this.currentBlock = updatedAction;
        } else {
            this.currentAction = updatedAction;
        }

        const { actingPlayerId, challengeSucceeded: success } = updatedAction;

        if (!isBlock && !success) {
            // An action was wrongly challenged
            this.tryToChargeForAction();
            this.tryToImplementAction();
        }

        if (isBlock && this.currentBlock) {
            if (success) {
                // A block was rightly challenged
                // The failed blocker automatically accepts the action
                this.currentAction.acceptedBy = {
                    ...this.currentAction.acceptedBy,
                    [actingPlayerId]: true,
                };
                this.tryToImplementAction();
            } else {
                // A block was wrongly challenged, so it goes through
                // No one else can block
                this.currentAction.canBlock = false;
            }
        }

        return {
            success,
            winnerId: success ? challengingPlayerId : actingPlayerId,
            loserId: success ? actingPlayerId : challengingPlayerId,
        };
    }

    block(
        actionId: string,
        playerId: string,
        blockActionType: BlockActionType,
        claimedCard: CardType,
    ): boolean {
        if (this.currentAction === undefined
            || !this.currentAction.canBlock
            || this.currentAction.blockedBy[playerId]
            || this.currentAction.id !== actionId) {
            // Trying to block a stale action,
            // an action that the user already blocked, or
            // an action that cannot be blocked (income / coup)
            return false;
        }

        // TODO: add logic here to see if it can be blocked - if player IS the target,
        // OR it's a target-less action that can be blocked, e.g., foreign aid

        // Keep track of who has blocked
        this.currentAction.blockedBy = {
            ...this.currentAction.blockedBy,
            [playerId]: true,
        };

        const acceptedOrBlockedByAll = isAcceptedOrBlockedByAll(this.currentAction);

        // It's now too late for players to challenge the initial action
        this.currentAction = {
            ...this.currentAction,
            canChallenge: false,
            canBlock: !acceptedOrBlockedByAll,
        };

        this.currentBlock = initializeAction(
            true,
            this.players,
            blockActionType,
            playerId,
            claimedCard,
            this.currentAction.actingPlayerId,
        );

        this.tryToChargeForAction();

        return true;
    }

    expireAction(actionId: string, isBlock: boolean): boolean {
        const action = isBlock ? this.currentBlock : this.currentAction;
        if (!action
            || action.id !== actionId) {
            // Stale action
            return false;
        }
        const { acceptedBy } = action;
        if (isAcceptedByAll(acceptedBy, this.players)) {
            // Everyone already accepted, stale action
            return false;
        }

        // Action is still active, we expire it
        const expiredAction = handleExpireAction(action);
        if (isBlock) {
            this.currentBlock = expiredAction;
        } else {
            this.currentAction = expiredAction;
        }

        return true;
    }

    tryToImplementAction(): boolean {
        if (!this.currentAction || !canImplementAction(this.currentAction)) {
            return false;
        }
        const {
            actionType,
            actingPlayerId: playerId,
            targetPlayerId: targetId,
        } = this.currentAction;

        const player = this.players.getOne(playerId);
        let drawnPlayerCards: Hand = [];
        if (targetId) {
            const target = this.players.getOne(targetId);
            switch (actionType) {
                // TODO: untangle this logic - Coup action is initialized with pendingTargetDiscard
                case ActionType.Coup:
                    player.removeCoins(7);
                    break;
                case ActionType.Assassinate:
                    this.currentAction.pendingTargetDiscard = true;
                    break;
                case ActionType.Steal: {
                    const numStolenCoins = target.removeCoins(2);
                    player.addCoins(numStolenCoins);
                    break;
                }
                default:
                    break;
            }
        }
        switch (actionType) {
            case ActionType.Income:
                player.addCoins(1);
                break;
            case ActionType.ForeignAid:
                player.addCoins(2);
                break;
            case ActionType.Tax:
                player.addCoins(3);
                break;
            case ActionType.Exchange:
                drawnPlayerCards = this.deck.draw(2);
                player.addExchangeCards(drawnPlayerCards);
                break;
            default:
                break;
        }

        this.tryNextTurn();
        return true;
    }

    tryToChargeForAction(): void {
        // Charges a player for an action if appropriate
        // (either it was challenged, or everyone has accepted it)
        if (!this.currentAction) {
            return;
        }
        const { canChallenge, actionType, actingPlayerId } = this.currentAction;

        if (canChallenge || this.pastBlocks.length > 0) {
            // Still waiting on people to accept / challenge,
            // or someone already tried a block which means the actor already paid
            return;
        }

        const player = this.players.getOne(actingPlayerId);

        switch (actionType) {
            case ActionType.Assassinate:
                player.removeCoins(3);
                break;
            default:
                break;
        }
    }

    discard(playerId: string, cardIds: Array<number>): boolean {
        const mostRecentAction = this.currentBlock || this.currentAction;

        if (!mostRecentAction) {
            // No action in this turn; no reason to discard
            return false;
        }

        // Check that the player who is requesting to discard should be discarding
        const { playerCanDiscard, targetPlayerDiscard } = canDiscard(playerId, mostRecentAction);

        if (!playerCanDiscard) {
            return false;
        }

        const player = this.players.getOne(playerId);
        player.killCards(cardIds);

        const updatedAction = handleDiscard(mostRecentAction, targetPlayerDiscard);
        const { isBlock } = updatedAction;
        if (isBlock && this.currentAction) {
            // The person who lost a challenge to a block has discarded,
            // so we can resolve it
            this.pastBlocks.push(updatedAction);
            this.currentBlock = undefined;

            // If as a result, the target of the initial action is eliminated,
            // there is no need to continue to resolve the action
            if (playerId === this.currentAction.targetPlayerId
                && player.cards.length === 0) {
                this.currentAction.canChallenge = false;
                this.currentAction.canBlock = false;
            }
        } else {
            this.currentAction = updatedAction;
        }

        this.tryNextTurn();

        return true;
    }

    exchange(playerId: string, cardIds: Array<number>): boolean {
        if (!this.currentAction) {
            // No exchange action has been called
            return false;
        }

        const { actingPlayerId, pendingActorExchange } = this.currentAction;

        if (!canImplementAction(this.currentAction)
            || !pendingActorExchange
            || actingPlayerId !== playerId) {
            // Player cannot exchange
            return false;
        }

        const player = this.players.getOne(playerId);

        if (player.exchangeCards.length === 0) {
            // Player has nothing to exchange
            return false;
        }

        const allCards = player.cards.concat(player.exchangeCards);
        const keptCards: CoupCard[] = [];
        const discardedCards: CoupCard[] = [];
        allCards.forEach((card) => {
            if (cardIds.includes(card.id)) {
                keptCards.push(card);
            } else {
                discardedCards.push(card);
            }
        });

        player.cards = keptCards;
        player.exchangeCards = [];
        this.deck.insert(discardedCards);

        this.currentAction.pendingActorExchange = false;

        // A successful exchange marks the end of a turn
        this.tryNextTurn();

        return true;
    }

    /** Getters */

    getPublic(): CoupGamePublic {
        return {
            id: this.id,
            owner: this.owner.getPublic(),
            name: this.name,
            players: this.players.getAllPublic(),
            started: this.started,
            currentTurn: this.currentTurn,
            currentAction: this.currentAction,
            currentBlock: this.currentBlock,
            pastBlocks: this.pastBlocks,
            deck: this.deck,
            won: this.won,
            winnerId: this.winnerId,
            winnerName: this.winnerName,
        };
    }
}

export default CoupGame;
