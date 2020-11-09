import RoomMember from '../RoomMember/RoomMember';
import RoomMembers from '../RoomMember/RoomMembers';

export interface RoomPublic {
    id: string,
    name: string,
    players: Array<RoomMember>
    maxPlayers: number
}

class Room {
    id: string
    name: string
    players: RoomMembers
    maxPlayers: number

    constructor(id: string, name: string, owner: RoomMember) {
        this.id = id;
        this.name = name;
        this.players = new RoomMembers([owner]);
        this.maxPlayers = 5;
    }

    addPlayer(player: RoomMember): void {
        this.players.addMember(player);
    }

    removePlayer(playerId: string): RoomMember {
        return this.players.removeMember(playerId);
    }

    /** Getters */

    getPublic(): RoomPublic {
        return {
            id: this.id,
            name: this.name,
            players: this.players.getAll(),
            maxPlayers: this.maxPlayers,
        };
    }
}

export default Room;
