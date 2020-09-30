import CoupPlayer from '../Player/CoupPlayer';
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

    getPlayer(playerId: string): CoupPlayer {
        return this.players[playerId];
    }

    getPlayers(): Array<CoupPlayer> {
        return Object.values(this.players);
    }

    dealToAll(hands: Hands): void {
        if (this.turnOrder.length === 0) {
            this.assignTurnOrder();
        }
        this.turnOrder.forEach((playerId, i) => {
            const player = this.getPlayer(playerId);
            player.addCards(hands[i]);
        });
    }

    getNumPlayers(): number {
        return Object.keys(this.players).length;
    }

    assignTurnOrder(): void {
        const playerIds = Object.keys(this.players);
        shuffle(playerIds);
        playerIds.forEach((playerId, i) => {
            this.players[playerId].turnNumber = i;
        });
        this.turnOrder = playerIds;
    }
}

export default CoupPlayers;
