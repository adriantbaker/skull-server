import { ActionType } from '../../../../listeners/coupGame/tryAction';
import { BlockActionType } from '../../../../listeners/coupGame/tryBlock';
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

interface ImplementResponse {
    implemented: boolean
    turnAdvanced: boolean
}

const invalidRequestResponse = {
    validRequest: false,
    turnAdvanced: false,
};

export interface GameResponse {
    validRequest: boolean
    turnAdvanced: boolean
}

export interface Turn {
    id: number
    number: number
    playerId: string
    playerName: string
    action: Action | undefined
    block: Action | undefined
    pastBlocks: Array<Action>
}

export interface CoupGamePublic {
    id: string,
    owner: CoupPlayerPublic
    name: string
    players: Array<CoupPlayerPublic>
    started: boolean
    currentTurn: Turn
    previousTurns: Array<Turn>
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
    previousTurns: Array<Turn>
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
            id: -1,
            number: -1,
            playerId: '',
            playerName: '',
            action: undefined,
            block: undefined,
            pastBlocks: [],
        };
        this.previousTurns = [];
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

    tryNextTurn(): boolean {
        if (this.currentTurn.action
            && !canAdvanceTurn(this.currentTurn.action, this.currentTurn.block)) {
            // Still some pending player action (block / discard / exchange)
            return false;
        }

        const activePlayerIds = this.players.getActivePlayerIds();

        if (activePlayerIds.length === 0) {
            console.log('Something has gone wrong - no players are left');
            return false;
        }

        // Advancing turn
        this.previousTurns = [{ ...this.currentTurn }].concat(this.previousTurns);

        this.currentTurn.action = undefined;
        this.currentTurn.block = undefined;
        this.currentTurn.pastBlocks = [];

        if (activePlayerIds.length === 1) {
            // Everyone else has been eliminated; we have a winner
            const [winnerId] = activePlayerIds;

            this.currentTurn = {
                ...this.currentTurn,
                id: this.currentTurn.id + 1,
                number: -1,
                playerId: '',
                playerName: '',
            };
            this.won = true;
            this.winnerId = winnerId;
            this.winnerName = this.players.getOne(winnerId).name;

            return true;
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
            ...this.currentTurn,
            id: this.currentTurn.id + 1,
            number: nextTurnNumber,
            playerId: nextTurnPlayerId,
            playerName: nextTurnPlayerName,
        };

        return true;
    }

    attempt(
        actionType: ActionType,
        playerId: string,
        claimedCard?: CardType,
        targetId?: string,
    ): GameResponse {
        if (this.currentTurn.action !== undefined) {
            // An action has already been declared
            return invalidRequestResponse;
        }

        // Set action
        this.currentTurn.action = initializeAction(
            false,
            this.players,
            actionType,
            playerId,
            claimedCard,
            targetId,
        );

        const { turnAdvanced } = this.tryToImplementAction();

        return {
            validRequest: true,
            turnAdvanced,
        };
    }

    accept(actionId: string, isBlock: boolean, playerId: string): GameResponse {
        const action = isBlock ? this.currentTurn.block : this.currentTurn.action;
        const updatedAction = handleAccept(actionId, action, playerId, this.players);
        if (!updatedAction) {
            // The player was unable to accept the action
            return invalidRequestResponse;
        }

        let turnAdvanced;

        // The action must be updated
        if (isBlock) {
            if (!this.currentTurn.action) {
                // Trying to accept a block when no action exists
                return invalidRequestResponse;
            }

            this.currentTurn.block = updatedAction;
            // If everyone has accepted the block, it is resolved
            const acceptedByAll = isAcceptedByAll(updatedAction.acceptedBy, this.players);
            if (acceptedByAll) {
                this.currentTurn.action.canBlock = false;
                this.currentTurn.pastBlocks.push(this.currentTurn.block);
                this.currentTurn.block = undefined;
            }
            turnAdvanced = this.tryNextTurn();
        } else {
            this.currentTurn.action = updatedAction;
            this.tryToChargeForAction();
            turnAdvanced = this.tryToImplementAction().turnAdvanced;
        }

        return {
            validRequest: true,
            turnAdvanced,
        };
    }

    challenge(
        actionId: string,
        isBlock: boolean,
        challengingPlayerId: string,
    ): GameResponse {
        if (!this.currentTurn.action || (isBlock && !this.currentTurn.block)) {
            return invalidRequestResponse;
        }

        const action = isBlock ? this.currentTurn.block : this.currentTurn.action;

        const updatedAction = handleChallenge(
            actionId, action, challengingPlayerId, this.players, this.deck,
        );

        if (!updatedAction) {
            // The player was unable to challenge the action
            return invalidRequestResponse;
        }

        // The action must be updated
        if (isBlock) {
            this.currentTurn.block = updatedAction;
        } else {
            this.currentTurn.action = updatedAction;
        }

        const { actingPlayerId, challengeSucceeded: success } = updatedAction;

        let turnAdvanced = false;

        if (!isBlock && !success) {
            // An action was wrongly challenged
            this.tryToChargeForAction();
            turnAdvanced = this.tryToImplementAction().turnAdvanced;
        }

        if (isBlock && this.currentTurn.block) {
            if (success) {
                // A block was rightly challenged
                // The failed blocker automatically accepts the action
                this.currentTurn.action.acceptedBy = {
                    ...this.currentTurn.action.acceptedBy,
                    [actingPlayerId]: true,
                };
                turnAdvanced = this.tryToImplementAction().turnAdvanced;
            } else {
                // A block was wrongly challenged, so it goes through
                // No one else can block
                this.currentTurn.action.canBlock = false;
            }
        }

        return {
            validRequest: true,
            turnAdvanced,
        };
    }

    block(
        actionId: string,
        playerId: string,
        blockActionType: BlockActionType,
        claimedCard: CardType,
    ): GameResponse {
        if (this.currentTurn.action === undefined
            || !this.currentTurn.action.canBlock
            || this.currentTurn.action.blockedBy[playerId]
            || this.currentTurn.action.id !== actionId) {
            // Trying to block a stale action,
            // an action that the user already blocked, or
            // an action that cannot be blocked (income / coup)
            return invalidRequestResponse;
        }

        // TODO: add logic here to see if it can be blocked - if player IS the target,
        // OR it's a target-less action that can be blocked, e.g., foreign aid

        // Keep track of who has blocked
        this.currentTurn.action.blockedBy = {
            ...this.currentTurn.action.blockedBy,
            [playerId]: true,
        };

        const acceptedOrBlockedByAll = isAcceptedOrBlockedByAll(this.currentTurn.action);

        // It's now too late for players to challenge the initial action
        this.currentTurn.action = {
            ...this.currentTurn.action,
            canChallenge: false,
            canBlock: !acceptedOrBlockedByAll,
        };

        this.currentTurn.block = initializeAction(
            true,
            this.players,
            blockActionType,
            playerId,
            claimedCard,
            this.currentTurn.action.actingPlayerId,
        );

        this.tryToChargeForAction();

        return {
            validRequest: true,
            turnAdvanced: false,
        };
    }

    expireAction(actionId: string, isBlock: boolean): boolean {
        const action = isBlock ? this.currentTurn.block : this.currentTurn.action;
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
            this.currentTurn.block = undefined;
            this.currentTurn.pastBlocks.push(expiredAction);
        } else {
            this.currentTurn.action = expiredAction;
        }

        return true;
    }

    tryToImplementAction(): ImplementResponse {
        if (!this.currentTurn.action || !canImplementAction(this.currentTurn.action)) {
            return {
                implemented: false,
                turnAdvanced: false,
            };
        }
        const {
            actionType,
            actingPlayerId: playerId,
            targetPlayerId: targetId,
        } = this.currentTurn.action;

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
                    this.currentTurn.action.pendingTargetDiscard = true;
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

        const turnAdvanced = this.tryNextTurn();
        return {
            implemented: true,
            turnAdvanced,
        };
    }

    tryToChargeForAction(): void {
        // Charges a player for an action if appropriate
        // (either it was challenged, or everyone has accepted it)
        if (!this.currentTurn.action) {
            return;
        }
        const { canChallenge, actionType, actingPlayerId } = this.currentTurn.action;

        if (canChallenge || this.currentTurn.pastBlocks.length > 0) {
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

    discard(playerId: string, cardIds: Array<number>): GameResponse {
        const mostRecentAction = this.currentTurn.block || this.currentTurn.action;

        if (!mostRecentAction) {
            // No action in this turn; no reason to discard
            return invalidRequestResponse;
        }

        // Check that the player who is requesting to discard should be discarding
        const { playerCanDiscard, targetPlayerDiscard } = canDiscard(playerId, mostRecentAction);

        if (!playerCanDiscard) {
            return invalidRequestResponse;
        }

        const player = this.players.getOne(playerId);
        player.killCards(cardIds);

        const updatedAction = handleDiscard(mostRecentAction, targetPlayerDiscard);
        const { isBlock } = updatedAction;
        if (isBlock && this.currentTurn.action) {
            // The person who lost a challenge to a block has discarded,
            // so we can resolve it
            this.currentTurn.pastBlocks.push(updatedAction);
            this.currentTurn.block = undefined;

            // If as a result, the target of the initial action is eliminated,
            // there is no need to continue to resolve the action
            if (playerId === this.currentTurn.action.targetPlayerId
                && player.cards.length === 0) {
                this.currentTurn.action.canChallenge = false;
                this.currentTurn.action.canBlock = false;
            }
        } else {
            this.currentTurn.action = updatedAction;
        }

        const turnAdvanced = this.tryNextTurn();

        return {
            validRequest: true,
            turnAdvanced,
        };
    }

    exchange(playerId: string, cardIds: Array<number>): GameResponse {
        if (!this.currentTurn.action) {
            // No exchange action has been called
            return invalidRequestResponse;
        }

        const { actingPlayerId, pendingActorExchange } = this.currentTurn.action;

        if (!canImplementAction(this.currentTurn.action)
            || !pendingActorExchange
            || actingPlayerId !== playerId) {
            // Player cannot exchange
            return invalidRequestResponse;
        }

        const player = this.players.getOne(playerId);

        if (player.exchangeCards.length === 0) {
            // Player has nothing to exchange
            return invalidRequestResponse;
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

        this.currentTurn.action.pendingActorExchange = false;

        // A successful exchange marks the end of a turn
        const turnAdvanced = this.tryNextTurn();

        return {
            validRequest: true,
            turnAdvanced,
        };
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
            previousTurns: this.previousTurns,
            deck: this.deck,
            won: this.won,
            winnerId: this.winnerId,
            winnerName: this.winnerName,
        };
    }
}

export default CoupGame;
