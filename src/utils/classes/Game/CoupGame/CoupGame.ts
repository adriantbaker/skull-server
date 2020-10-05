import { ActionType } from '../../../../listeners/coupGame/tryAction';
import { BlockActionType } from '../../../../listeners/coupGame/tryBlock';
import { ChallengeOutcome } from '../../../interfaces/signals';
import CoupCard, { CardType } from '../../Card/CoupCard';
import Deck from '../../Deck/CoupDeck';
import CoupPlayer, { CoupPlayerPublic } from '../../Player/CoupPlayer';
import CoupPlayers from '../../Player/CoupPlayers';
import deckCardTypes from '../deckCardTypes';
import initializeAction, { Action } from './initializers/initializeAction';
import handleAccept from './methodHelpers/handleAccept';
import handleChallenge from './methodHelpers/handleChallenge';
import handleExpireAction from './methodHelpers/handleExpireAction';
import isAcceptedByAll from './methodHelpers/isAcceptedByAll';

export interface Turn {
    number: number,
    playerId: string,
    playerName: string
}

export interface CoupGamePublic {
    id: string,
    owner: CoupPlayerPublic,
    name: string,
    players: Array<CoupPlayerPublic>,
    started: boolean,
    currentTurn: Turn,
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
        const nextTurnNumber = (this.currentTurn.number + 1) % this.numPlayers;
        const nextTurnPlayerId = this.players.turnOrder[nextTurnNumber];
        const nextTurnPlayerName = this.players.getOne(nextTurnPlayerId).name;
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
        } else {
            this.currentAction = updatedAction;
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
