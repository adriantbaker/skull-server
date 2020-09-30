import CoupPlayer, { CoupPlayerPrivate, CoupPlayerPublic } from './CoupPlayer';
import shuffle from '../../helpers/shuffle';
import { Hands } from '../Deck/CoupDeck';

class CoupPlayers {
    players: { [key: string]: CoupPlayer }
    turnOrder: Array<string>

    constructor(players: Array<CoupPlayer> = []) {
        this.players = {};
        this.turnOrder = [];
        players.forEach((player) => {
            this.players[player.id] = player;
        });
    }

    addPlayer(player: CoupPlayer): void {
        this.players[player.id] = player;
    }

    removePlayer(playerId: string): CoupPlayer {
        const player = this.players[playerId];
        delete this.players[playerId];
        return player;
    }

    dealToAll(hands: Hands): void {
        if (this.turnOrder.length === 0) {
            this.assignTurnOrder();
        }
        this.turnOrder.forEach((playerId, i) => {
            const player = this.getOne(playerId);
            player.addCards(hands[i]);
        });
    }

    assignTurnOrder(): void {
        const playerIds = Object.keys(this.players);
        shuffle(playerIds);
        playerIds.forEach((playerId, i) => {
            this.players[playerId].turnNumber = i;
        });
        this.turnOrder = playerIds;
    }

    /** Getters */

    getOne(playerId: string): CoupPlayer {
        return this.players[playerId];
    }

    /**
     * @description Get player information that a player can know about oneself
     */
    getOnePublic(playerId: string): CoupPlayerPublic {
        return this.players[playerId].getPublic();
    }

    /**
     * @description Get player information that a player can know about one's opponent
     */
    getOnePrivate(playerId: string): CoupPlayerPrivate {
        return this.players[playerId].getPrivate();
    }

    getAll(): Array<CoupPlayer> {
        return Object.values(this.players);
    }

    getAllPublic(): Array<CoupPlayerPublic> {
        return Object.values(this.players).map((player) => player.getPublic());
    }

    /**
     *
     * @param playerId ID of the player whose opponents will be returned
     */
    getOpponentsPublic(playerId: string): Array<CoupPlayerPublic> {
        return Object.values(this.players)
            .filter((player) => player.id !== playerId)
            .map((player) => player.getPublic());
    }

    getNumPlayers(): number {
        return Object.keys(this.players).length;
    }
}

export default CoupPlayers;
