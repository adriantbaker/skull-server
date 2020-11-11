import CoupGame from '../Game/CoupGame/CoupGame';
import CoupPlayer from '../Player/CoupPlayer';
import CoupPlayers from '../Player/CoupPlayers';
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
    gameIsActive: boolean
    game: CoupGame | undefined

    constructor(id: string, name: string, owner: RoomMember) {
        this.id = id;
        this.name = name;
        this.players = new RoomMembers([owner]);
        this.maxPlayers = 5;
        this.gameIsActive = false;
        this.game = undefined;
    }

    addPlayer(player: RoomMember): void {
        this.players.addMember(player);
    }

    removePlayer(playerId: string): RoomMember {
        return this.players.removeMember(playerId);
    }

    startGame(): void {
        const players = new CoupPlayers(
            this.players.getAll()
                .map((member) => new CoupPlayer(member.name, member.id, member.isOwner)),
        );
        this.game = new CoupGame(this.name, players, this.id);
        this.game.startGame();
        this.gameIsActive = true;
    }

    endGame(): void {
        if (this.game && this.game.won) {
            const { winnerId } = this.game;
            this.players.getOne(winnerId).numWins += 1;
        }
        this.players.resetReadiness();
        this.game = undefined;
        this.gameIsActive = false;
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
