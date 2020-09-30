import CoupPlayer, { CoupPlayerPublic } from '../Player/CoupPlayer';
import CoupPlayers from '../Player/CoupPlayers';

export interface RoomPublic {
    id: string,
    name: string,
    owner: CoupPlayerPublic
    players: Array<CoupPlayerPublic>
    maxPlayers: number
}

class Room {
    id: string
    name: string
    owner: CoupPlayer
    players: CoupPlayers
    maxPlayers: number

    constructor(name: string, owner: CoupPlayer) {
        this.id = owner.id + name + Date.now();
        this.name = name;
        this.owner = owner;
        this.players = new CoupPlayers([owner]);
        this.maxPlayers = 5;
    }

    addPlayer(player: CoupPlayer): void {
        this.players.addPlayer(player);
    }

    removePlayer(playerId: string): CoupPlayer {
        return this.players.removePlayer(playerId) as CoupPlayer;
    }

    /** Getters */

    getPublic(): RoomPublic {
        return {
            id: this.id,
            name: this.name,
            owner: this.owner.getPublic(),
            players: this.players.getAllPublic(),
            maxPlayers: this.maxPlayers,
        };
    }
}

export default Room;
