import generateShortId from '../../helpers/generateShortId';
import Room, { RoomPublic } from './Room';
import RoomMember from '../RoomMember/RoomMember';

class Rooms {
    rooms: { [key: string]: Room }

    constructor() {
        this.rooms = {};
    }

    addRoom(roomName: string, owner: RoomMember): Room {
        let roomID = generateShortId();
        while (this.rooms[roomID]) {
            // Room ID already in use
            roomID = generateShortId();
        }

        const room = new Room(roomID, roomName, owner);
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
        return Object.values(this.rooms)
            .filter((room) => !room.gameIsActive)
            .map((room) => room.getPublic());
    }

    getNumRooms(): number {
        return Object.keys(this.rooms).length;
    }
}

export default Rooms;
