import { ActionType, BlockActionType } from '../../../listeners/coupGame/tryAction';
import { ChallengeOutcome } from '../../interfaces/signals';
import CoupCard, { CardType } from '../Card/CoupCard';
import Deck from '../Deck/CoupDeck';
import CoupPlayer, { CoupPlayerPublic } from '../Player/CoupPlayer';
import CoupPlayers from '../Player/CoupPlayers';
import deckCardTypes from './deckCardTypes';

export interface Action {
    isBlock: boolean,
    actionType: ActionType | BlockActionType,
    claimedCard: CardType | undefined,
    actingPlayerId: string,
    actingPlayerName: string,
    targetPlayerId: string | undefined,
    targetPlayerName: string | undefined,
    canChallenge: boolean,
    canBlock: boolean,
    challenged: boolean,
    challengeSucceeded: boolean,
    challengingPlayerId: string | undefined,
}

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

        const playerName = this.players.getOne(playerId).name;
        let targetName;
        if (targetId) {
            targetName = this.players.getOne(targetId).name;
        }

        // Set action
        this.currentAction = {
            isBlock: false,
            actionType,
            claimedCard,
            actingPlayerId: playerId,
            actingPlayerName: playerName,
            targetPlayerId: targetId,
            targetPlayerName: targetName,
            canChallenge: true,
            challenged: false,
            challengeSucceeded: false,
            challengingPlayerId: undefined,
            canBlock: true,
        };

        return true;
    }

    challenge(challengingPlayerId: string): ChallengeOutcome | undefined {
        if (this.currentAction === undefined) {
            // The player whose turn it is has not yet attempted an action
            return undefined;
        }

        if (!this.currentAction.canChallenge || this.currentAction.claimedCard === undefined) {
            // Can't challenge action (someone else already challenged it,
            // or it's income / foreign aid)
            return undefined;
        }

        // The challenge is valid - this means no one else can challenge
        const challengeEffects = {
            canChallenge: false,
            challenged: true,
            challengingPlayerId,
        };

        // Check if the challenged player is bluffing
        const { claimedCard, actingPlayerId } = this.currentAction;
        const actingPlayer = this.players.getOne(actingPlayerId);
        const actingPlayerCard = actingPlayer.searchForCardOfType(claimedCard);

        if (actingPlayerCard === undefined) {
            // Challenger was successful
            this.currentAction = {
                ...this.currentAction,
                ...challengeEffects,
                challengeSucceeded: true,
            };

            return {
                success: true,
                vindicatedPlayerHand: undefined,
                winnerId: challengingPlayerId,
                loserId: actingPlayerId,
            };
        }

        // Else - challenger was unsuccessful
        this.currentAction = {
            ...this.currentAction,
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
            vindicatedPlayerHand: actingPlayer.cards,
            winnerId: actingPlayerId,
            loserId: challengingPlayerId,
        };
    }

    block(
        playerId: string,
        blockActionType: BlockActionType,
        claimedCard: CardType,
    ): boolean {
        if (this.currentAction === undefined) {
            // There is no action to block
            return false;
        }

        // TODO: add logic here to see if it can be blocked - if player IS the target,
        // OR it's a target-less action that can be blocked, e.g., foreign aid

        // It's now too late for players to challenge the initial action
        this.currentAction = {
            ...this.currentAction,
            canChallenge: false,
        };

        const playerName = this.players.getOne(playerId).name;

        this.currentBlock = {
            isBlock: true,
            actionType: blockActionType,
            actingPlayerId: playerId,
            actingPlayerName: playerName,
            claimedCard,
            targetPlayerId: this.currentAction.actingPlayerId,
            targetPlayerName: this.currentAction.actingPlayerName,
            canChallenge: true,
            challenged: false,
            challengeSucceeded: false,
            challengingPlayerId: undefined,
            canBlock: false,
        };

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
