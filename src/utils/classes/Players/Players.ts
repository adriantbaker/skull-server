import CardPlayer from '../Player/CardPlayer';
import CoupPlayer from '../Player/CoupPlayer';
import Player from '../Player/Player';
import shuffle from '../../helpers/shuffle';

export type AnyPlayer = Player | CardPlayer | CoupPlayer

class Players<PlayerType extends AnyPlayer> {
    players: { [key: string]: PlayerType }
    turnOrder: Array<string>

    constructor(players: Array<PlayerType> = []) {
        this.players = {};
        this.turnOrder = [];
        players.forEach((player) => {
            this.players[player.id] = player;
        });
    }

    addPlayer(player: PlayerType): void {
        this.players[player.id] = player;
    }

    removePlayer(playerId: string): PlayerType {
        const player = this.players[playerId];
        delete this.players[playerId];
        return player;
    }

    getPlayer(playerId: string): PlayerType {
        return this.players[playerId];
    }

    getPlayers(): Array<PlayerType> {
        return Object.values(this.players);
    }

    // getPlayersPublic(): Array<PlayerPublic> {
    //     return Object.values(this.players)
    //         .map((player) => player.getPublic());
    // }

    // getOpponentsPublic(playerId: string): Array<PlayerPublic> {
    //     return Object.values(this.players)
    //         .filter((player) => player.id !== playerId)
    //         .map((player) => player.getPublic());
    // }

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

export default Players;
