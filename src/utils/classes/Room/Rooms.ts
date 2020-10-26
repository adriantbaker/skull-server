import generateID from '../../helpers/generateID';
import Room, { RoomPublic } from './Room';
import Trie from '../Trie/Trie';
import CoupPlayer from '../Player/CoupPlayer';

class Rooms {
    rooms: { [key: string]: Room }
    roomIDs: Trie

    constructor() {
        this.rooms = {};
        this.roomIDs = new Trie();
    }

    addRoom(roomName: string, owner: CoupPlayer): Room {
        let roomID = generateID();
        while (this.roomIDs.contains(roomID)) {
            roomID = generateID();
        }

        const room = new Room(roomID, roomName, owner);

        this.roomIDs.insert(roomID);
        this.rooms[roomID] = room;

        return room;
    }

    removeRoom(roomId: string): Room {
        const room = this.rooms[roomId];
        delete this.rooms[roomId];
        return room;
    }

    /** Getters */

    getOne(roomId: string): Room {
        return this.rooms[roomId];
    }

    getOnePublic(roomId: string): RoomPublic {
        return this.rooms[roomId].getPublic();
    }

    getAll(): Array<Room> {
        return Object.values(this.rooms);
    }

    getAllPublic(): Array<RoomPublic> {
        return Object.values(this.rooms).map((room) => room.getPublic());
    }

    getNumRooms(): number {
        return Object.keys(this.rooms).length;
    }
}

export default Rooms;
