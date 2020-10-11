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
    deck: Deck
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
    deck: Deck

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
        const mostRecentAction = this.currentBlock || this.currentAction;
        if (mostRecentAction) {
            if (!canAdvanceTurn(mostRecentAction)) {
                // Still some pending player action (discard / exchange)
                return;
            }
        }

        const nextTurnNumber = (this.currentTurn.number + 1) % this.numPlayers;
        const nextTurnPlayerId = this.players.turnOrder[nextTurnNumber];
        const nextTurnPlayerName = this.players.getOne(nextTurnPlayerId).name;
        this.currentTurn = {
            number: nextTurnNumber,
            playerId: nextTurnPlayerId,
            playerName: nextTurnPlayerName,
        };
        this.currentAction = undefined;
        this.currentBlock = undefined;
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
        const updatedAction = handleAccept(actionId, action, playerId);
        if (!updatedAction) {
            // The player was unable to accept the action
            return false;
        }
        // The action must be updated
        if (isBlock) {
            this.currentBlock = updatedAction;
            this.tryNextTurn();
        } else {
            this.currentAction = updatedAction;
            this.tryToImplementAction();
        }

        return true;
    }

    challenge(
        actionId: string,
        isBlock: boolean,
        challengingPlayerId: string,
    ): ChallengeOutcome | undefined {
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

        if ((isBlock && success) || (!isBlock && !success)) {
            // An action was wrongly challenged, or a counteraction was rightly challenged
            // The initial action should go through
            this.tryToImplementAction();
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
            || this.currentAction.id !== actionId) {
            // Trying to block a stale action or an action that
            // cannot be blocked (income / coup)
            return false;
        }

        // TODO: add logic here to see if it can be blocked - if player IS the target,
        // OR it's a target-less action that can be blocked, e.g., foreign aid

        // It's now too late for players to challenge / block the initial action
        this.currentAction = {
            ...this.currentAction,
            canChallenge: false,
            canBlock: false,
        };

        this.currentBlock = initializeAction(
            true,
            this.players,
            blockActionType,
            playerId,
            claimedCard,
            this.currentAction.actingPlayerId,
        );

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
        if (isAcceptedByAll(acceptedBy)) {
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
        const actionToImplement = this.currentAction;
        if (!actionToImplement || !canImplementAction(actionToImplement)) {
            return false;
        }
        const {
            actionType,
            actingPlayerId: playerId,
            targetPlayerId: targetId,
        } = actionToImplement;

        const player = this.players.getOne(playerId);
        let drawnPlayerCards: Hand = [];
        if (targetId) {
            const target = this.players.getOne(targetId);
            switch (actionType) {
                case ActionType.Coup:
                    player.removeCoins(7);
                    break;
                case ActionType.Assassinate:
                    player.removeCoins(3);
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

    discard(playerId: string, cardIds: Array<number>): boolean {
        const mostRecentAction = this.currentBlock || this.currentAction;

        if (!mostRecentAction) {
            // No action in this turn; no reason to discard
            return false;
        }

        const player = this.players.getOne(playerId);
        player.killCards(cardIds);

        // Check that the player who is requesting to discard should be discarding
        const { playerCanDiscard, targetPlayerDiscard } = canDiscard(playerId, mostRecentAction);

        if (!playerCanDiscard) {
            return false;
        }

        const updatedAction = handleDiscard(mostRecentAction, targetPlayerDiscard);
        const { isBlock } = updatedAction;
        if (isBlock) {
            this.currentBlock = updatedAction;
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
            deck: this.deck,
        };
    }
}

export default CoupGame;
