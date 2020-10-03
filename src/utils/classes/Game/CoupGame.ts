import { ActionType } from '../../../listeners/coupGame/tryAction';
import { BlockActionType } from '../../../listeners/coupGame/tryBlock';
import { ChallengeOutcome } from '../../interfaces/signals';
import CoupCard, { CardType } from '../Card/CoupCard';
import Deck from '../Deck/CoupDeck';
import CoupPlayer, { CoupPlayerPublic } from '../Player/CoupPlayer';
import CoupPlayers from '../Player/CoupPlayers';
import deckCardTypes from './deckCardTypes';
import initializeAction, { Action } from './initializeAction';

export interface CoupGamePublic {
    id: string,
    owner: CoupPlayerPublic,
    name: string,
    players: Array<CoupPlayerPublic>,
    started: boolean,
    currentTurn: number,
    currentAction: Action | undefined,
    currentBlock: Action | undefined,
    deck: Deck
}

class CoupGame {
    id: string
    owner: CoupPlayer
    name: string
    players: CoupPlayers
    numPlayers: number
    started: boolean
    currentTurn: number
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
        this.currentTurn = -1;
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
        return this.players.removePlayer(playerId) as CoupPlayer;
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
        this.nextTurn();
    }

    nextTurn(): void {
        this.currentTurn = (this.currentTurn + 1) % this.numPlayers;
    }

    attempt(
        actionType: ActionType,
        playerId: string,
        claimedCard?: CardType,
        targetId?: string,
    ): boolean {
        if (this.currentAction !== undefined) {
            // An action has already been declared
            return false;
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

        return true;
    }

    accept(actionId: string, playerId: string): boolean {
        if (this.currentAction === undefined
            || !this.currentAction.canChallenge
            || this.currentAction.id !== actionId) {
            // Trying to accept a stale action
            return false;
        }
        if (this.currentAction.acceptedBy[playerId]) {
            // Already accepted the action
            return false;
        }
        this.currentAction.acceptedBy[playerId] = true;
        return true;
    }

    challenge(
        actionId: string,
        isBlock: boolean,
        challengingPlayerId: string,
    ): ChallengeOutcome | undefined {
        const challengedActionKey = isBlock ? 'currentBlock' : 'currentAction';
        const challengedAction = this[challengedActionKey];

        if (!challengedAction
            || !challengedAction.canChallenge
            || !challengedAction.claimedCard
            || challengedAction.id !== actionId) {
            // Trying to challenge a stale action or an action that
            // cannot be challenged (income / foreign aid / coup)
            return undefined;
        }

        if (challengedAction.acceptedBy[challengingPlayerId]) {
            // Can't challenge the action after accepting it
            return undefined;
        }

        // The challenge is valid - this means no one else can challenge
        const challengeEffects = {
            canChallenge: false,
            challenged: true,
            challengingPlayerId,
            challengeLoserMustDiscard: true,
            isComplete: true,
        };

        // Check if the challenged player is bluffing
        const { claimedCard, actingPlayerId } = challengedAction;
        const actingPlayer = this.players.getOne(actingPlayerId);
        const actingPlayerCard = actingPlayer.searchForCardOfType(claimedCard);

        if (actingPlayerCard === undefined) {
            // Challenger was successful
            this[challengedActionKey] = {
                ...challengedAction,
                ...challengeEffects,
                challengeSucceeded: true,
            };

            return {
                success: true,
                winnerId: challengingPlayerId,
                loserId: actingPlayerId,
            };
        }

        // Else - challenger was unsuccessful
        this[challengedActionKey] = {
            ...challengedAction,
            ...challengeEffects,
            challengeSucceeded: false,
        };

        // Player who was wrongly challenged trades their card for a new one
        const removedCard = actingPlayer.removeCard(actingPlayerCard.id);
        this.deck.insert([removedCard]);
        const newCard = this.deck.drawOne();
        actingPlayer.addCards([newCard]);

        return {
            success: false,
            winnerId: actingPlayerId,
            loserId: challengingPlayerId,
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

    income(playerId: string): void {
        const player = this.players.getOne(playerId);
        player.addCoins(1);
    }

    foreignAid(playerId: string): void {
        const player = this.players.getOne(playerId);
        player.addCoins(2);
    }

    coup(playerId: string, targetId: string): void {
        const player = this.players.getOne(playerId);
        // const target = this.players.getOne(targetId);
        player.removeCoins(7);
        // TODO: prompt target to choose 1 card to remove
    }

    tax(playerId: string): void {
        const player = this.players.getOne(playerId);
        player.addCoins(3);
    }

    assassinate(playerId: string, targetId: string): void {
        const player = this.players.getOne(playerId);
        // const target = this.players.getOne(targetId);
        player.removeCoins(3);
        // TODO: prompt target to choose 1 card to remove
    }

    steal(playerId: string, targetId: string): void {
        const player = this.players.getOne(playerId);
        const target = this.players.getOne(targetId);
        target.removeCoins(2);
        player.addCoins(2);
        // TODO: account for player having less than 2 coins
    }

    exchange(playerId: string): void {
        const player = this.players.getOne(playerId);
        const newCards = this.deck.draw(2);
        player.addCards(newCards);
        // TODO: prompt player to choose which 2 to keep, which 2 to discard
        this.deck.insert(newCards);
    }

    // blockForeignAid() {

    // }

    // blockAssassination() {

    // }

    // blockSteal() {

    // }

    // challenge() {

    // }

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
